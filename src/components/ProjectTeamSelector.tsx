import { useState } from "react";
import { Check, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjectStore } from "@/zustand/projectStore";
import { useToast } from "@/hooks/use-toast";

interface ProjectTeamSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

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

export const ProjectTeamSelector = ({ isOpen, onClose, projectId }: ProjectTeamSelectorProps) => {
  const { 
    globalTeamMembers, 
    getProjectById, 
    assignMemberToProject, 
    removeMemberFromProject 
  } = useProjectStore();
  const { toast } = useToast();

  const project = getProjectById(projectId);
  const assignedMemberIds = project?.assignedMembers || [];

  const handleToggleMember = (memberId: string) => {
    const isAssigned = assignedMemberIds.includes(memberId);
    const member = globalTeamMembers.find(m => m.id === memberId);
    
    if (isAssigned) {
      removeMemberFromProject(projectId, memberId);
      toast({
        title: "Member removed",
        description: `${member?.name} has been removed from the project.`,
      });
    } else {
      assignMemberToProject(projectId, memberId);
      toast({
        title: "Member assigned",
        description: `${member?.name} has been assigned to the project.`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Assign Team Members</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {project && (
            <p className="text-muted-foreground">
              Select team members for "{project.name}"
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {globalTeamMembers?.map((member) => {
            const isAssigned = assignedMemberIds.includes(member.id);
            
            return (
              <Card 
                key={member.id} 
                className={`cursor-pointer transition-all ${
                  isAssigned ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleToggleMember(member.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{member.name}</h4>
                          <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                            {getRoleIcon(member.role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: <span className={`font-medium ${
                            member.status === "online" ? "text-success" :
                            member.status === "away" ? "text-warning" : "text-muted-foreground"
                          }`}>
                            {member.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${isAssigned 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground"
                      }
                    `}>
                      {isAssigned && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {assignedMemberIds?.length} of {globalTeamMembers?.length} members assigned
          </p>
          
          <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};