import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Edit3, Copy, Trash2, History, GitBranch, Eye, EyeOff, Search, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import VersionHistory from "@/components/VersionHistory";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: "string" | "number" | "boolean" | "secret";
  lastModified: string;
  modifiedBy: string;
  environment: "development" | "staging" | "production";
  isEditing?: boolean;
  editedBy?: string;
}

const variables: EnvVariable[] = [
  {
    id: "1",
    key: "API_KEY",
    value: "sk-1234567890abcdef",
    description: "Main API key for external service",
    type: "secret",
    lastModified: "2 minutes ago",
    modifiedBy: "Alice Johnson",
    environment: "development",
    isEditing: true,
    editedBy: "Alice Johnson"
  },
  {
    id: "2",
    key: "DATABASE_URL",
    value: "postgresql://user:pass@localhost:5432/mydb",
    description: "Database connection string",
    type: "secret",
    lastModified: "1 hour ago",
    modifiedBy: "Bob Chen",
    environment: "development",
    isEditing: true,
    editedBy: "Bob Chen"
  },
  {
    id: "3",
    key: "PORT",
    value: "3000",
    description: "Server port number",
    type: "number",
    lastModified: "1 day ago",
    modifiedBy: "Carol Davis",
    environment: "development"
  },
  {
    id: "4",
    key: "DEBUG",
    value: "true",
    description: "Enable debug mode",
    type: "boolean",
    lastModified: "2 days ago",
    modifiedBy: "David Wilson",
    environment: "development"
  },
  {
    id: "5",
    key: "REDIS_URL",
    value: "redis://localhost:6379",
    description: "Redis connection URL",
    type: "string",
    lastModified: "3 days ago",
    modifiedBy: "Alice Johnson",
    environment: "production"
  }
];

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

  const filteredVariables = variables.filter(variable =>
    variable.environment === selectedEnvironment &&
    (variable.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyVariable = (variable: EnvVariable) => {
    navigator.clipboard.writeText(`${variable.key}=${variable.value}`);
    toast({
      title: "Copied to clipboard",
      description: `${variable.key} copied successfully`,
    });
  };

  const handleAddVariable = () => {
    toast({
      title: "Variable added",
      description: `${newVariable.key} has been added to ${selectedEnvironment}`,
    });
    setNewVariable({ key: "", value: "", description: "", type: "string" });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">E-commerce API</h1>
            <p className="text-muted-foreground">Environment variables and configuration</p>
          </div>
          <Badge variant="secondary" className="status-synced">
            <GitBranch className="w-3 h-3 mr-1" />
            Synced
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
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
                {filteredVariables.length} variables
              </Badge>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
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
                  <Button onClick={handleAddVariable} className="w-full">
                    Add Variable
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Variables Table */}
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
                    <TableRow key={variable.id} className="border-border hover:bg-muted/30">
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
                          <div className="text-foreground">{variable.lastModified}</div>
                          <div className="text-muted-foreground">by {variable.modifiedBy}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingVariable(variable)}
                            className="h-8 w-8 p-0"
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Modal */}
      <VersionHistory open={showHistory} onOpenChange={setShowHistory} />
    </div>
  );
};

export default ProjectDetail;