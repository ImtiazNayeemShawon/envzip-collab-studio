import { useState } from "react";
import { Users, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Collaborator {
  id: string;
  name: string;
  initials: string;
  status: "online" | "offline" | "away";
  color: "collaborator-1" | "collaborator-2" | "collaborator-3" | "collaborator-4";
  currentlyEditing?: string;
}

const mockCollaborators: Collaborator[] = [
  {
    id: "1",
    name: "Alice Johnson",
    initials: "AJ",
    status: "online",
    color: "collaborator-1",
    currentlyEditing: "API_KEY"
  },
  {
    id: "2",
    name: "Bob Chen",
    initials: "BC",
    status: "online",
    color: "collaborator-2",
    currentlyEditing: "DATABASE_URL"
  },
  {
    id: "3",
    name: "Carol Davis",
    initials: "CD",
    status: "away",
    color: "collaborator-3"
  },
  {
    id: "4",
    name: "David Wilson",
    initials: "DW",
    status: "offline",
    color: "collaborator-4"
  }
];

const CollaborationPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true);

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
            <h3 className="font-semibold text-foreground">Collaborators</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {mockCollaborators.filter(c => c.status === "online").length} online
            </span>
          </div>
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

      {/* Collaborators List */}
      <div className="p-4 space-y-3">
        {mockCollaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className={`
              flex items-center space-x-3 p-3 rounded-lg transition-smooth
              ${collaborator.status === "online" ? "bg-muted/30" : "opacity-60"}
              hover:bg-muted/50 cursor-pointer
            `}
          >
            <div className="relative">
              <Avatar className={`w-8 h-8 ${collaborator.color}`}>
                <AvatarFallback className="text-xs font-medium">
                  {collaborator.initials}
                </AvatarFallback>
              </Avatar>
              <Circle
                className={`
                  absolute -bottom-1 -right-1 w-3 h-3 border-2 border-card rounded-full
                  ${collaborator.status === "online" ? "fill-success text-success" : 
                    collaborator.status === "away" ? "fill-warning text-warning" : 
                    "fill-muted text-muted"}
                `}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {collaborator.name}
              </p>
              {collaborator.currentlyEditing && (
                <p className="text-xs text-muted-foreground">
                  Editing <span className="font-mono text-primary">{collaborator.currentlyEditing}</span>
                </p>
              )}
            </div>
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
    </div>
  );
};

export default CollaborationPanel;