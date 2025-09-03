import { useState } from "react";
import { Calendar, User, GitCommit, RotateCcw, Plus, Minus, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface VersionChange {
  type: "added" | "removed" | "modified";
  key: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

interface Version {
  id: string;
  timestamp: string;
  author: string;
  environment: "development" | "staging" | "production";
  changes: VersionChange[];
  message?: string;
}

const mockVersions: Version[] = [
  {
    id: "v1.2.3",
    timestamp: "2024-01-15 14:30:00",
    author: "Alice Johnson",
    environment: "development",
    message: "Update API key and add Redis configuration",
    changes: [
      {
        type: "modified",
        key: "API_KEY",
        oldValue: "sk-old123456789",
        newValue: "sk-1234567890abcdef",
        description: "Updated to new API key from vendor"
      },
      {
        type: "added",
        key: "REDIS_URL",
        newValue: "redis://localhost:6379",
        description: "Added Redis connection for caching"
      }
    ]
  },
  {
    id: "v1.2.2",
    timestamp: "2024-01-14 09:15:00",
    author: "Bob Chen",
    environment: "development",
    message: "Database connection updates",
    changes: [
      {
        type: "modified",
        key: "DATABASE_URL",
        oldValue: "postgresql://user:pass@localhost:5432/olddb",
        newValue: "postgresql://user:pass@localhost:5432/mydb",
        description: "Updated database name"
      },
      {
        type: "removed",
        key: "OLD_FEATURE_FLAG",
        oldValue: "true",
        description: "Removed deprecated feature flag"
      }
    ]
  },
  {
    id: "v1.2.1",
    timestamp: "2024-01-13 16:45:00",
    author: "Carol Davis",
    environment: "development",
    message: "Initial port configuration",
    changes: [
      {
        type: "added",
        key: "PORT",
        newValue: "3000",
        description: "Set default server port"
      },
      {
        type: "added",
        key: "DEBUG",
        newValue: "true",
        description: "Enable debug mode for development"
      }
    ]
  }
];

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangeIcon = ({ type }: { type: VersionChange["type"] }) => {
  switch (type) {
    case "added":
      return <Plus className="w-4 h-4 text-success" />;
    case "removed":
      return <Minus className="w-4 h-4 text-destructive" />;
    case "modified":
      return <Edit3 className="w-4 h-4 text-warning" />;
    default:
      return <GitCommit className="w-4 h-4 text-muted-foreground" />;
  }
};

const ChangeValue = ({ change }: { change: VersionChange }) => {
  return (
    <div className="space-y-1">
      {change.type === "modified" && (
        <>
          <div className="text-sm">
            <span className="text-muted-foreground">From: </span>
            <code className="bg-destructive/10 text-destructive px-1 py-0.5 rounded text-xs font-mono">
              {change.oldValue}
            </code>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">To: </span>
            <code className="bg-success/10 text-success px-1 py-0.5 rounded text-xs font-mono">
              {change.newValue}
            </code>
          </div>
        </>
      )}
      {change.type === "added" && (
        <div className="text-sm">
          <span className="text-muted-foreground">Added: </span>
          <code className="bg-success/10 text-success px-1 py-0.5 rounded text-xs font-mono">
            {change.newValue}
          </code>
        </div>
      )}
      {change.type === "removed" && (
        <div className="text-sm">
          <span className="text-muted-foreground">Removed: </span>
          <code className="bg-destructive/10 text-destructive px-1 py-0.5 rounded text-xs font-mono">
            {change.oldValue}
          </code>
        </div>
      )}
    </div>
  );
};

const VersionHistory = ({ open, onOpenChange }: VersionHistoryProps) => {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleRollback = (versionId: string) => {
    toast({
      title: "Version rollback initiated",
      description: `Rolling back to version ${versionId}`,
    });
  };

  const handleRollbackChange = (versionId: string, changeKey: string) => {
    toast({
      title: "Variable rollback initiated",
      description: `Rolling back ${changeKey} to version ${versionId}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-primary" />
            <span>Version History</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[600px]">
          {/* Version List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Versions</h3>
            <ScrollArea className="h-[500px] pr-4">
              {mockVersions.map((version, index) => (
                <div key={version.id} className="space-y-2">
                  <div
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-smooth
                      ${selectedVersion === version.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground hover:bg-muted/30"
                      }
                    `}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {version.id}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-xs">
                          {version.environment}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback(version.id);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Rollback
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{version.author}</span>
                        <Calendar className="w-3 h-3 ml-2" />
                        <span>{version.timestamp}</span>
                      </div>
                      
                      {version.message && (
                        <p className="text-sm text-foreground">{version.message}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{version.changes.length} changes</span>
                        <span>•</span>
                        <span>
                          {version.changes.filter(c => c.type === "added").length} added,{" "}
                          {version.changes.filter(c => c.type === "modified").length} modified,{" "}
                          {version.changes.filter(c => c.type === "removed").length} removed
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < mockVersions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Version Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {selectedVersion ? `Changes in ${selectedVersion}` : "Select a version to view changes"}
            </h3>
            
            {selectedVersion ? (
              <ScrollArea className="h-[500px] pr-4">
                {mockVersions
                  .find(v => v.id === selectedVersion)
                  ?.changes.map((change, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border mb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <ChangeIcon type={change.type} />
                          <code className="font-mono font-medium syntax-key">{change.key}</code>
                          <Badge 
                            variant="secondary" 
                            className={`
                              capitalize text-xs
                              ${change.type === "added" ? "status-synced" : 
                                change.type === "removed" ? "status-conflict" : 
                                "status-editing"}
                            `}
                          >
                            {change.type}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRollbackChange(selectedVersion, change.key)}
                          className="h-6 px-2 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rollback
                        </Button>
                      </div>

                      <ChangeValue change={change} />
                      
                      {change.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {change.description}
                        </p>
                      )}
                    </div>
                  ))}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a version from the left to view detailed changes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistory;