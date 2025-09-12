import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Clock, Users, AlertCircle, CheckCircle2, Edit3, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/zustand/projectStore";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectTeamSelector } from "@/components/ProjectTeamSelector";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "@/components/loading";
import { useEffect } from "react";
import { getProjects } from "@/appwrite/projectHandler";
import { deleteProject as deleteProjectFromDB } from "@/appwrite/projectHandler";



const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "synced":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "editing":
      return <Edit3 className="w-4 h-4 text-warning" />;
    case "conflict":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    synced: "status-synced",
    editing: "status-editing",
    conflict: "status-conflict"
  } as const;

  return (
    <Badge variant="secondary" className={`${variants[status as keyof typeof variants]} capitalize`}>
      {status}
    </Badge>
  );
};

const Dashboard = () => {

  const { projects, deleteProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>();
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const setProjects = useProjectStore((state) => state.setProjects)

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res);
        console.log(res);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);




  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage environment variables across all your projects
          </p>
        </div>
        <Button
          onClick={() => setIsProjectFormOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-border">
            <DropdownMenuItem>All Projects</DropdownMenuItem>
            <DropdownMenuItem>Active</DropdownMenuItem>
            <DropdownMenuItem>With Conflicts</DropdownMenuItem>
            <DropdownMenuItem>Recently Updated</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:bg-card-hover transition-smooth cursor-pointer border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/project/${project.$id}`}>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth mb-1">
                      {project.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-smooth">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => {
                      setEditingProject(project);
                      setIsProjectFormOpen(true);
                    }}>
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedProjectId(project.$id);
                      setIsTeamSelectorOpen(true);
                    }}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Assign Team
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/${project.id}/team`}>
                        Manage Team
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => { deleteProject(project.$id), deleteProjectFromDB(project.$id) }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              {/* Environment Status */}
              <div className="space-y-2 mb-4">
                {project?.latestEnvs?.map((env) => (
                  <div key={env.name} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <StatusIcon status={env.environment} />
                      <span className="text-sm font-medium capitalize text-foreground">{env.key}</span>
                      <StatusBadge status={env.environment} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {env.lastUpdated}
                    </div>
                  </div>
                ))}
              </div>

              {/* Project Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project?.collaborators?.length || 0} collaborators</span>
                </div>
                <div className="text-xs">
                  {project?.envCount} variables
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {isLoading ? <div className="mx-auto  h-96 flex flex-col items-center"><LoadingScreen /></div> : <div className="text-center py-12">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or create a new project.
        </p>
      </div>}

      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(undefined);
        }}
        project={editingProject}
      />

      <ProjectTeamSelector
        isOpen={isTeamSelectorOpen}
        onClose={() => {
          setIsTeamSelectorOpen(false);
          setSelectedProjectId("");
        }}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default Dashboard;