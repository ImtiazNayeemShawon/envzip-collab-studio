import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, UserPlus, Mail, Crown, Shield, User, MoreVertical, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjectStore, TeamMember } from "@/zustand/projectStore";
import { TeamMemberForm } from "@/components/TeamMemberForm";

const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner":
      return <Crown className="w-4 h-4 text-yellow-500" />;
    case "admin":
      return <Shield className="w-4 h-4 text-blue-500" />;
    default:
      return <User className="w-4 h-4 text-muted-foreground" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
};

const TeamManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, removeTeamMember } = useProjectStore();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();

  const project = id ? getProjectById(id) : undefined;

  if (!project) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members for "{project.name}"
          </p>
        </div>
        <Button 
          onClick={() => setIsTeamFormOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.teamMembers.map((member) => (
          <Card key={member.id} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-foreground">{member.name}</CardTitle>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>

                {member.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => {
                        setEditingMember(member);
                        setIsTeamFormOpen(true);
                      }}>
                        Edit Member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => removeTeamMember(project.id, member.id)}
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(member.role)}
                  <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                    {member.role}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {member.joinedAt}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {project.teamMembers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by adding members to this project.
            </p>
            <Button 
              onClick={() => setIsTeamFormOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Member
            </Button>
          </div>
        )}
      </div>

      <TeamMemberForm
        isOpen={isTeamFormOpen}
        onClose={() => {
          setIsTeamFormOpen(false);
          setEditingMember(undefined);
        }}
        projectId={project.id}
        member={editingMember}
      />
    </div>
  );
};

export default TeamManagement;