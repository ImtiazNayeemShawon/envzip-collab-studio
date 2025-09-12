import { useEffect, useState } from "react";
import { Calendar, User, GitCommit, RotateCcw, Plus, Minus, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getVersionHistory,
  createVersionOnUpdate,
  createVersionOnDelete,
  createInitialVersion,
  getVersionById
} from "../appwrite/versionHandler";
import { rollbackEnvVariable, updateEnvVariable } from "@/appwrite/envhandler";


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

const VersionHistory = ({ open, onOpenChange, $id }: any) => {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (open) fetchVersions();
  }, [open]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const versionDocs = await getVersionHistory($id);
      // Sort by timestamp descending (latest first)
      const sortedDocs = versionDocs.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const mappedVersions: Version[] = sortedDocs.map((v: any) => ({
        id: v.versionId,
        timestamp: v.createdAt,
        author: v.createdBy,
        environment: v.environment,
        message: v.message,
        changes: v.changes.map((c: any) => ({
          type: c.changeType as "added" | "removed" | "modified",
          key: c.field,
          oldValue: c.oldValue,
          newValue: c.newValue,
          description: c.description,
        })),
      }));
      setVersions(mappedVersions);
    } catch (err) {
      console.error("❌ Error fetching versions:", err);
      toast({
        title: "Failed to load versions",
        description: "Check console for details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (versionId: string) => {

    try {

      toast({
        title: "Rollback successful",
        description: `Rolled back to version ${versionId}`,
      });

      fetchVersions(); // Refresh version list after rollback
    } catch (err) {
      console.error("❌ Full rollback failed:", err);
      toast({
        title: "Rollback failed",
        description: "Check console for details",
      });
    }
  };

  const handleRollbackChange = async (versionId: string, changeKey: string) => {
    try {
      const versionData = await getVersionById(versionId);
      const targetEnvVariableId = (versionData as any).envVariableId;
      if (!targetEnvVariableId) throw new Error("envVariableId missing in version data");

      const change = (versionData as any).changes?.find((c: any) => c.field === changeKey);
      if (!change) throw new Error("Change not found in version");

      const updates: Record<string, any> = {};
      if (changeKey === 'tags') {
        updates[changeKey] = Array.isArray(change.oldValue) ? JSON.stringify(change.oldValue) : change.oldValue;
      } else {
        updates[changeKey] = change.oldValue ?? null;
      }

      await updateEnvVariable(targetEnvVariableId, updates);

      toast({
        title: "Field rollback successful",
        description: `${changeKey} rolled back to version ${versionId}`,
      });

      fetchVersions();
    } catch (err) {
      console.error("❌ Field rollback failed:", err);
      toast({
        title: "Rollback failed",
        description: "Check console for details",
      });
    }
  };

  // const handleRollbackChange = async (versionId: string, changeKey: string) => {
  //   try {
  //     const version = versions.find(v => v.id === versionId);
  //     if (!version) return;

  //     const change = version.changes.find(c => c.key === changeKey);
  //     if (!change) throw new Error("Variable not found in version");

  //     await restoreEnvVariable(change);

  //     toast({
  //       title: "Variable rollback successful",
  //       description: `${changeKey} rolled back to version ${versionId}`,
  //     });

  //     fetchVersions(); // Refresh version list
  //   } catch (err) {
  //     console.error("❌ Variable rollback failed:", err);
  //     toast({
  //       title: "Rollback failed",
  //       description: "Check console for details",
  //     });
  //   }
  // };



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
              {versions.map((version, index) => (
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
                        <Badge variant="secondary" className="font-mono text-[10px]">
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
                        <span>{new Date(version.timestamp).toLocaleString()}</span>
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
                  {index < versions.length - 1 && <Separator className="my-2" />}
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
                {versions
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