import { create } from 'zustand';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member";
    avatar?: string;
    joinedAt: string;
    status: "online" | "offline" | "away";
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
    assignedMembers: string[]; // Array of team member IDs
}


type ProjectStore = {
    projects: Project[];
    globalTeamMembers: TeamMember[];
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (id: string, updated: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    getProjectById: (id: string) => Project | undefined;
    addGlobalTeamMember: (member: Omit<TeamMember, 'id'>) => void;
    removeGlobalTeamMember: (memberId: string) => void;
    updateGlobalTeamMember: (memberId: string, updated: Partial<TeamMember>) => void;
    assignMemberToProject: (projectId: string, memberId: string) => void;
    removeMemberFromProject: (projectId: string, memberId: string) => void;
    getProjectMembers: (projectId: string) => TeamMember[];
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
    globalTeamMembers: [
        { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "owner", joinedAt: "2024-01-15", status: "online" },
        { id: "2", name: "Bob Chen", email: "bob@example.com", role: "admin", joinedAt: "2024-02-01", status: "online" },
        { id: "3", name: "Carol Davis", email: "carol@example.com", role: "member", joinedAt: "2024-02-15", status: "away" },
        { id: "4", name: "David Wilson", email: "david@example.com", role: "member", joinedAt: "2024-03-01", status: "offline" }
    ],
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
            collaborators: 3,
            totalVariables: 23,
            assignedMembers: ["1", "2", "3"]
        }
    ],
    addProject: (project) =>
        set((state) => ({
            projects: [...state.projects, { 
                ...project, 
                id: Date.now().toString(),
                assignedMembers: []
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
    addGlobalTeamMember: (member) =>
        set((state) => ({
            globalTeamMembers: [...state.globalTeamMembers, { 
                ...member, 
                id: Date.now().toString(),
                status: "offline"
            }]
        })),
    removeGlobalTeamMember: (memberId) =>
        set((state) => ({
            globalTeamMembers: state.globalTeamMembers.filter(member => member.id !== memberId),
            projects: state.projects.map(proj => ({
                ...proj,
                assignedMembers: proj.assignedMembers.filter(id => id !== memberId),
                collaborators: proj.assignedMembers.filter(id => id !== memberId).length
            }))
        })),
    updateGlobalTeamMember: (memberId, updated) =>
        set((state) => ({
            globalTeamMembers: state.globalTeamMembers.map(member =>
                member.id === memberId ? { ...member, ...updated } : member
            )
        })),
    assignMemberToProject: (projectId, memberId) =>
        set((state) => ({
            projects: state.projects.map(proj =>
                proj.id === projectId && !proj.assignedMembers.includes(memberId)
                    ? { 
                        ...proj, 
                        assignedMembers: [...proj.assignedMembers, memberId],
                        collaborators: proj.assignedMembers.length + 1
                    }
                    : proj
            )
        })),
    removeMemberFromProject: (projectId, memberId) =>
        set((state) => ({
            projects: state.projects.map(proj =>
                proj.id === projectId
                    ? { 
                        ...proj, 
                        assignedMembers: proj.assignedMembers.filter(id => id !== memberId),
                        collaborators: Math.max(0, proj.collaborators - 1)
                    }
                    : proj
            )
        })),
    getProjectMembers: (projectId) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return [];
        return state.globalTeamMembers.filter(member => 
            project.assignedMembers.includes(member.id)
        );
    },
}));