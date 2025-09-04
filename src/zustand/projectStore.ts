import { create } from 'zustand';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member";
    avatar?: string;
    joinedAt: string;
}

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
    teamMembers: TeamMember[];
}


type ProjectStore = {
    projects: Project[];
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (id: string, updated: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
    addTeamMember: (projectId: string, member: Omit<TeamMember, 'id'>) => void;
    removeTeamMember: (projectId: string, memberId: string) => void;
    updateTeamMember: (projectId: string, memberId: string, updated: Partial<TeamMember>) => void;
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
            totalVariables: 23,
            teamMembers: [
                { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "owner", joinedAt: "2024-01-15" },
                { id: "2", name: "Bob Chen", email: "bob@example.com", role: "admin", joinedAt: "2024-02-01" },
                { id: "3", name: "Carol Davis", email: "carol@example.com", role: "member", joinedAt: "2024-02-15" }
            ]
        }
    ],
    addProject: (project) =>
        set((state) => ({
            projects: [...state.projects, { 
                ...project, 
                id: Date.now().toString(),
                teamMembers: []
            }]
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
    addTeamMember: (projectId, member) =>
        set((state) => ({
            projects: state.projects.map((proj) =>
                proj.id === projectId 
                    ? { 
                        ...proj, 
                        teamMembers: [...proj.teamMembers, { ...member, id: Date.now().toString() }],
                        collaborators: proj.collaborators + 1
                    } 
                    : proj
            )
        })),
    removeTeamMember: (projectId, memberId) =>
        set((state) => ({
            projects: state.projects.map((proj) =>
                proj.id === projectId 
                    ? { 
                        ...proj, 
                        teamMembers: proj.teamMembers.filter(member => member.id !== memberId),
                        collaborators: Math.max(0, proj.collaborators - 1)
                    } 
                    : proj
            )
        })),
    updateTeamMember: (projectId, memberId, updated) =>
        set((state) => ({
            projects: state.projects.map((proj) =>
                proj.id === projectId 
                    ? { 
                        ...proj, 
                        teamMembers: proj.teamMembers.map(member =>
                            member.id === memberId ? { ...member, ...updated } : member
                        )
                    } 
                    : proj
            )
        })),
}));