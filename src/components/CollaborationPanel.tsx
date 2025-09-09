import { useState } from "react";
import { Users, ChevronRight, Circle, UserPlus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/zustand/projectStore";
import { TeamMemberForm } from "@/components/TeamMemberForm";

const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner":
      return "👑";
    case "admin":
      return "🛡️";
    default:
      return "👤";
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

const CollaborationPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(undefined);
  const { globalTeamMembers, removeGlobalTeamMember } = useProjectStore();

  if (!isExpanded) {
    return (
      <div className="w-12 border-l border-border bg-card/30 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full h-8 p-0"
        >
          <Users className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Team Members</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {globalTeamMembers?.filter(c => c.status === "online").length} online
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTeamFormOpen(true)}
              className="h-8 w-8 p-0"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="p-4 space-y-3">
        {globalTeamMembers?.map((member) => (
          <div
            key={member.id}
            className={`
              flex items-center space-x-3 p-3 rounded-lg transition-smooth
              ${member.status === "online" ? "bg-muted/30" : "opacity-60"}
              hover:bg-muted/50
            `}
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Circle
                className={`
                  absolute -bottom-1 -right-1 w-3 h-3 border-2 border-card rounded-full
                  ${member.status === "online" ? "fill-success text-success" : 
                    member.status === "away" ? "fill-warning text-warning" : 
                    "fill-muted text-muted"}
                `}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.name}
                </p>
                <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                  {getRoleIcon(member.role)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p>
            </div>

            {member.role !== "owner" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
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
                    onClick={() => removeGlobalTeamMember(member.id)}
                  >
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="p-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 fill-success text-success" />
            <span>Alice updated <code className="font-mono">API_KEY</code></span>
            <span className="text-xs">2m ago</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 fill-warning text-warning" />
            <span>Bob added <code className="font-mono">REDIS_URL</code></span>
            <span className="text-xs">5m ago</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 fill-primary text-primary" />
            <span>Carol synced production env</span>
            <span className="text-xs">12m ago</span>
          </div>
        </div>
      </div>

      <TeamMemberForm
        isOpen={isTeamFormOpen}
        onClose={() => {
          setIsTeamFormOpen(false);
          setEditingMember(undefined);
        }}
        projectId=""
        member={editingMember}
        isGlobalTeam={true}
      />
    </div>
  );
};

export default CollaborationPanel;