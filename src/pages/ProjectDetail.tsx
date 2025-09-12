import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Edit3, Copy, Trash2, History, GitBranch, Eye, EyeOff, Search, Download, Upload, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import VersionHistory from "@/components/VersionHistory";
import useEnvVariableStore from "@/zustand/envStore";
import { getProjectById } from "@/appwrite/projectHandler";

interface EnvVariable {
  $id: string;
  key: string;
  value: string;
  description?: string;
  type: "string" | "number" | "boolean" | "secret";
  lastModified: string;
  modifiedBy: string;
  environment: "development" | "staging" | "production";
  isEditing?: boolean;
  editedBy?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
}

const VariableValue = ({ variable }: { variable: EnvVariable }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (variable.type === "secret" && !isVisible) {
    return (
      <div className="flex items-center space-x-2">
        <span className="font-mono text-sm">••••••••••••</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="h-6 w-6 p-0"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`font-mono text-sm ${getValueColor(variable.type, variable.value)}`}>
        {variable.value}
      </span>
      {variable.type === "secret" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <EyeOff className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const getValueColor = (type: string, value: string) => {
  switch (type) {
    case "string":
      return "syntax-string";
    case "number":
      return "syntax-number";
    case "boolean":
      return value === "true" ? "syntax-boolean" : "syntax-boolean";
    case "secret":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
};

const CollaboratorIndicator = ({ editedBy }: { editedBy: string }) => {
  const collaboratorColors = {
    "Alice Johnson": "collaborator-1",
    "Bob Chen": "collaborator-2",
    "Carol Davis": "collaborator-3",
    "David Wilson": "collaborator-4"
  } as const;

  const color = collaboratorColors[editedBy as keyof typeof collaboratorColors] || "collaborator-1";

  return (
    <div className={`w-3 h-3 rounded-full animate-pulse-subtle ${color}`} />
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedEnvironment, setSelectedEnvironment] = useState("development");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(null);
  const [newVariable, setNewVariable] = useState({ key: "", value: "", description: "", type: "string" });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Enhanced store integration with real-time
  const {
    envVariables,
    loading,
    error,
    addEnvVariable,
    deleteEnvVariable,
    updateEnvVariable,
    fetchEnvVariables,
    startRealtime,
    stopRealtime,
    clearStore,
    refresh
  } = useEnvVariableStore();

  // Setup real-time connection and data fetching
  useEffect(() => {
    if (!id) return;

    console.log(`🔄 Setting up ProjectDetail for project: ${id}`);

    const setupProject = async () => {
      try {
        // Fetch project details
        const projectData = await getProjectById(id);
        setProject(projectData);
        console.log(`✅ Project loaded: ${projectData?.name}`);

        // Clear previous data and fetch fresh environment variables
        clearStore();
        await fetchEnvVariables(id);
        console.log(`✅ Environment variables loaded for project: ${id}`);

        // Start real-time subscription
        startRealtime(id);
        setIsRealtimeConnected(true);
        console.log(`✅ Real-time connection established for project: ${id}`);

      } catch (error) {
        console.error(`❌ Error setting up project ${id}:`, error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      }
    };

    setupProject();

    // Cleanup on unmount or project change
    return () => {
      console.log(`🧹 Cleaning up ProjectDetail for project: ${id}`);
      stopRealtime();
      setIsRealtimeConnected(false);
    };
  }, [id, fetchEnvVariables, startRealtime, stopRealtime, clearStore]);

  // Handle real-time connection errors
  useEffect(() => {
    if (error) {
      console.error("❌ Environment variables error:", error);
      setIsRealtimeConnected(false);
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter variables based on environment and search
  const filteredVariables = envVariables.filter(variable =>
    variable.environment === selectedEnvironment &&
    (variable.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyVariable = (variable: EnvVariable) => {
    navigator.clipboard.writeText(`${variable.key}=${variable.value}`);
    toast({
      title: "Copied to clipboard",
      description: `${variable.key} copied successfully`,
    });
  };

  const handleAddVariable = async () => {
    if (!newVariable.key.trim()) {
      toast({
        title: "Error",
        description: "Variable key is required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`🔄 Adding new variable: ${newVariable.key}`);
      
      await addEnvVariable({
        projectId: id || "",
        environment: selectedEnvironment,
        key: newVariable.key,
        value: newVariable.value,
        description: newVariable.description,
        type: newVariable.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setNewVariable({ key: "", value: "", description: "", type: "string" });

      toast({
        title: "Variable added",
        description: `${newVariable.key} has been added to ${selectedEnvironment}`,
      });

      console.log(`✅ Variable added successfully: ${newVariable.key}`);
    } catch (error) {
      console.error("❌ Failed to add variable:", error);
      toast({
        title: "Error",
        description: "Failed to add variable",
        variant: "destructive",
      });
    }
  };

  const handleEditVariable = (variable: EnvVariable) => {
    setEditingVariable({ ...variable });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVariable = async () => {
    if (!editingVariable) return;

    if (!editingVariable.key.trim()) {
      toast({
        title: "Error",
        description: "Variable key is required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`🔄 Updating variable: ${editingVariable.key}`);

      await updateEnvVariable(editingVariable.$id, {
        projectId: id || "",
        key: editingVariable.key,
        value: editingVariable.value,
        description: editingVariable.description,
        type: editingVariable.type,
        environment: editingVariable.environment,
        updatedAt: new Date().toISOString(),
      });

      setIsEditDialogOpen(false);
      setEditingVariable(null);

      toast({
        title: "Variable updated",
        description: `${editingVariable.key} has been updated successfully`,
      });

      console.log(`✅ Variable updated successfully: ${editingVariable.key}`);
    } catch (error) {
      console.error("❌ Failed to update variable:", error);
      toast({
        title: "Error",
        description: "Failed to update variable",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVariable = async (variable: EnvVariable) => {
    try {
      console.log(`🔄 Deleting variable: ${variable.key}`);

      await deleteEnvVariable(variable.$id);

      toast({
        title: "Variable deleted",
        description: `${variable.key} has been deleted from ${variable.environment}`,
      });

      console.log(`✅ Variable deleted successfully: ${variable.key}`);
    } catch (error) {
      console.error("❌ Failed to delete variable:", error);
      toast({
        title: "Error",
        description: "Failed to delete variable",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    if (!id) return;
    
    try {
      console.log("🔄 Manual refresh requested");
      await refresh(id);
      toast({
        title: "Refreshed",
        description: "Environment variables have been refreshed",
      });
    } catch (error) {
      console.error("❌ Failed to refresh:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  const resetNewVariable = () => {
    setNewVariable({ key: "", value: "", description: "", type: "string" });
  };

  const resetEditVariable = () => {
    setEditingVariable(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project?.name || "Loading..."}</h1>
            <p className="text-muted-foreground">{project?.description || "Loading project details..."}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="status-synced">
              <GitBranch className="w-3 h-3 mr-1" />
              Synced
            </Badge>
            {/* Real-time connection indicator */}
            <Badge variant={isRealtimeConnected ? "default" : "destructive"} className="flex items-center">
              {isRealtimeConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> Real-time</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
              )}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <History className="w-4 h-4 mr-2" />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Environment Tabs */}
      <Tabs value={selectedEnvironment} onValueChange={setSelectedEnvironment} className="mb-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="development" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Development
          </TabsTrigger>
          <TabsTrigger value="staging" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Staging
          </TabsTrigger>
          <TabsTrigger value="production" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Production
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedEnvironment} className="mt-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Badge variant="secondary" className="text-muted-foreground">
                {filteredVariables?.length || 0} variables
              </Badge>
              {loading && (
                <Badge variant="outline" className="text-blue-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin mr-2"></div>
                  Loading...
                </Badge>
              )}
            </div>

            {/* Add Variable Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add New Variable</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      value={newVariable.key}
                      onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                      placeholder="VARIABLE_NAME"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      value={newVariable.value}
                      onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                      placeholder="variable_value"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newVariable.type} onValueChange={(value) => setNewVariable({ ...newVariable, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="secret">Secret</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={newVariable.description}
                      onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                      placeholder="Describe what this variable is used for..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline" onClick={resetNewVariable} className="flex-1">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleAddVariable} className="flex-1" disabled={loading}>
                        Add Variable
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Variables Table */}
          {filteredVariables.length === 0 && !loading ? (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Environment Variables</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No variables found matching "${searchQuery}" in ${selectedEnvironment} environment.`
                    : `No variables configured for ${selectedEnvironment} environment yet.`
                  }
                </p>
                {!searchQuery && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Variable
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Key</TableHead>
                      <TableHead className="text-foreground">Value</TableHead>
                      <TableHead className="text-foreground">Type</TableHead>
                      <TableHead className="text-foreground">Description</TableHead>
                      <TableHead className="text-foreground">Last Modified</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVariables.map((variable) => (
                      <TableRow key={variable.$id} className="border-border hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-medium syntax-key">{variable.key}</span>
                            {variable.isEditing && variable.editedBy && (
                              <CollaboratorIndicator editedBy={variable.editedBy} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <VariableValue variable={variable} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {variable.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {variable.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-foreground">
                              {variable.updatedAt ? new Date(variable.updatedAt).toLocaleString() : variable.lastModified}
                            </div>
                            <div className="text-muted-foreground">
                              by {variable.lastUpdatedBy || variable.modifiedBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVariable(variable)}
                              className="h-8 w-8 p-0"
                              disabled={loading}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyVariable(variable)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Variable</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the variable "{variable.key}"?
                                    This action cannot be undone and will remove it from the {variable.environment} environment.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteVariable(variable)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Variable Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Variable</DialogTitle>
          </DialogHeader>
          {editingVariable && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-key">Key</Label>
                <Input
                  id="edit-key"
                  value={editingVariable.key}
                  onChange={(e) => setEditingVariable({ ...editingVariable, key: e.target.value })}
                  placeholder="VARIABLE_NAME"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="edit-value">Value</Label>
                <Input
                  id="edit-value"
                  value={editingVariable.value}
                  onChange={(e) => setEditingVariable({ ...editingVariable, value: e.target.value })}
                  placeholder="variable_value"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editingVariable.type}
                  onValueChange={(value) => setEditingVariable({ ...editingVariable, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingVariable.description || ""}
                  onChange={(e) => setEditingVariable({ ...editingVariable, description: e.target.value })}
                  placeholder="Describe what this variable is used for..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={resetEditVariable} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateVariable} className="flex-1" disabled={loading}>
                  Update Variable
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Version History Modal */}
      <VersionHistory open={showHistory} onOpenChange={setShowHistory} $id={id} />
    </div>
  );
};

export default ProjectDetail;