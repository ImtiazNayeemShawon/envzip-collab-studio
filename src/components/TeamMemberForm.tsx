import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useProjectStore, TeamMember } from "@/zustand/projectStore";
import { useToast } from "@/hooks/use-toast";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "member"], {
    required_error: "Please select a role",
  }),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  member?: TeamMember;
  isGlobalTeam?: boolean;
}

export const TeamMemberForm = ({ isOpen, onClose, projectId, member, isGlobalTeam = false }: TeamMemberFormProps) => {
  const addGlobalTeamMember = useProjectStore((state) => state.addGlobalTeamMember);
  const updateGlobalTeamMember = useProjectStore((state) => state.updateGlobalTeamMember);
  const assignMemberToProject = useProjectStore((state) => state.assignMemberToProject);
  const { toast } = useToast();

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      role: member?.role === "owner" ? "admin" : (member?.role as "admin" | "member") || "member",
    },
  });

  const onSubmit = (data: TeamMemberFormData) => {
    if (isGlobalTeam) {
      if (member) {
        updateGlobalTeamMember(member.id, data);
        toast({
          title: "Team member updated",
          description: "Team member has been updated successfully.",
        });
      } else {
        addGlobalTeamMember({
          name: data.name,
          email: data.email,
          role: data.role,
          joinedAt: new Date().toLocaleDateString(),
          status: "offline"
        });
        toast({
          title: "Team member added",
          description: "New team member has been added to the global team.",
        });
      }
    } else {
      // This is for project-specific assignment (handled in ProjectTeamSelector)
      toast({
        title: "Feature not implemented",
        description: "Use the project team selector for assignments.",
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
              {member ? "Edit Team Member" : "Add Team Member"}
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
                  <FormLabel className="text-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
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
                {member ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};