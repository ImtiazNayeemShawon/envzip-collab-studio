import { create } from 'zustand';

export interface Project {
    id: string;
    name: string;
    description: string;
    environments: Array<{
        name: "development" | "staging" | "production";
        status: "synced" | "editing" | "conflict";
        lastUpdated: string;
        updatedBy: string;
    }>;
    collaborators: number;
    totalVariables: number;
}


type ProjectStore = {
    projects: Project[];
    addProject: (project: Project) => void;
    updateProject: (id: string, updated: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [
        {
            id: "1",
            name: "E-commerce API",
            description: "Main backend API for the e-commerce platform",
            environments: [
                { name: "development", status: "editing", lastUpdated: "2 minutes ago", updatedBy: "Alice Johnson" },
                { name: "staging", status: "synced", lastUpdated: "1 hour ago", updatedBy: "Bob Chen" },
                { name: "production", status: "synced", lastUpdated: "1 day ago", updatedBy: "Carol Davis" }
            ],
            collaborators: 4,
            totalVariables: 23
        }
    ],
    addProject: (project) =>
        set((state) => ({
            projects: [...state.projects, project]
        })),
    updateProject: (id, updated) =>
        set((state) => ({
            projects: state.projects.map((proj) =>
                proj.id === id ? { ...proj, ...updated } : proj
            )
        })),
    deleteProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((proj) => proj.id !== id)
        })),
    getProjectById: (id) => get().projects.find((proj) => proj.id === id),
}));