import { create } from "zustand";

export const useProjectStore = create<any>((set, get) => ({
  projects: [],

  // Replace all projects
  setProjects: (projects) => set(() => ({ projects })),

  // Add a new project
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          $id: Date.now().toString(),
          collaborators: [], // consistent key
        },
      ],
    })),

  // Update project
  updateProject: ($id, updated) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.$id === $id ? { ...proj, ...updated } : proj
      ),
    })),

  // Delete project
  deleteProject: ($id) =>
    set((state) => ({
      projects: state.projects.filter((proj) => proj.$id !== $id),
    })),

  // Get project by ID
  getProjectById: (id) => get().projects.find((proj) => proj.id === id),

  // Assign member to project
  assignMemberToProject: (projectId, memberId) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === projectId && !proj.collaborators.includes(memberId)
          ? {
              ...proj,
              collaborators: [...proj.collaborators, memberId],
            }
          : proj
      ),
    })),

  // Remove member from project
  removeMemberFromProject: (projectId, memberId) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              collaborators: proj.collaborators.filter((id) => id !== memberId),
            }
          : proj
      ),
    })),
}));
