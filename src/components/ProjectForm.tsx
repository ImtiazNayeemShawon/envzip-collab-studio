import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useProjectStore, Project } from "@/zustand/projectStore";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export const ProjectForm = ({ isOpen, onClose, project }: ProjectFormProps) => {
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (project) {
      updateProject(project.id, data);
      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      });
    } else {
      addProject({
        name: data.name,
        description: data.description,
        environments: [
          { name: "development", status: "editing", lastUpdated: "Just now", updatedBy: "You" },
          { name: "staging", status: "synced", lastUpdated: "Never", updatedBy: "-" },
          { name: "production", status: "synced", lastUpdated: "Never", updatedBy: "-" }
        ],
        collaborators: 1,
        totalVariables: 0,
        teamMembers: []
      });
      toast({
        title: "Project created",
        description: "New project has been created successfully.",
      });
    }
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">
              {project ? "Edit Project" : "Create New Project"}
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
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      className="bg-background border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                      className="bg-background border-border text-foreground min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {project ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};