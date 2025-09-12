// store/projectStore.ts
import { create } from "zustand";
import {
  listTeamMembers,
  createTeamMember as createTeamMemberDb,
  updateTeamMember as updateTeamMemberDb,
  removeMemberFromProjectDb,
  setMemberStatus as setMemberStatusDb,
  subscribeTeamMembers,
  subscribeProjectMembers,
  listProjectMembers,
} from "@/appwrite/teamHandler";

import { addCollaboratorToProject, deleteCollaborator } from "@/appwrite/projectHandler";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  createdAt?: string;
  status: "online" | "offline" | "away";
};

export const useProjectStore = create<any>((set, get) => ({
  projects: [],
  globalTeamMembers: [] as TeamMember[],
  onlineTeamMembers: [] as string[], // 👈 store emails of online users
  _tmUnsub: null,
  _pmUnsub: null,

  // ---------- Utils ----------
  _syncOnlineMembers: () => {
    const online = get()
      .globalTeamMembers.filter((m: TeamMember) => m.status === "online")
      .map((m) => m.email);
    set({ onlineTeamMembers: online });
  },

  // ---------- Project ----------
  setProjects: (projects) => set(() => ({ projects })),
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          $id: project?.$id || Date.now().toString(),
          collaborators: project?.collaborators ?? [],
        },
      ],
    })),
  updateProject: ($id, updated) =>
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.$id === $id ? { ...proj, ...updated } : proj
      ),
    })),
  deleteProject: ($id) =>
    set((state) => ({
      projects: state.projects.filter((proj) => proj.$id !== $id),
    })),
  getProjectById: ($id) => get().projects.find((proj) => proj.$id === $id),

  // ---------- Assignments ----------
  assignMemberToProject: async (projectId: string, email: string) => {
    await addCollaboratorToProject(projectId, email);
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.$id === projectId && !proj.collaborators?.includes(email)
          ? { ...proj, collaborators: [...(proj.collaborators || []), email] }
          : proj
      ),
    }));
  },

  removeMemberFromProject: async (projectId: string, memberEmail: string) => {
    await deleteCollaborator(projectId, memberEmail);
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.$id === projectId
          ? {
              ...proj,
              collaborators: (proj.collaborators || []).filter(
                (email) => email !== memberEmail
              ),
            }
          : proj
      ),
    }));
  },

  // ---------- Team Members ----------
  loadTeamMembers: async () => {
    const docs = await listTeamMembers();
    set({
      globalTeamMembers: docs.map((d: any) => ({
        id: d.$id,
        name: d.name,
        email: d.email,
        role: d.role,
        status: d.status || "offline",
      })),
    });
    get()._syncOnlineMembers();
  },

  addGlobalTeamMember: async (member: any) => {
    const doc = await createTeamMemberDb(member);
    set((state) => ({
      globalTeamMembers: [
        ...state.globalTeamMembers,
        {
          id: doc.$id,
          name: doc.name,
          email: doc.email,
          role: doc.role,
          status: doc.status || "offline",
        },
      ],
    }));
    get()._syncOnlineMembers();
  },

  updateGlobalTeamMember: async (
    memberId: string,
    updates: Partial<Omit<TeamMember, "id">>
  ) => {
    const doc = await updateTeamMemberDb(memberId, updates as any);
    set((state) => ({
      globalTeamMembers: state.globalTeamMembers.map((m: TeamMember) =>
        m.id === memberId
          ? {
              ...m,
              name: doc.name ?? m.name,
              email: doc.email ?? m.email,
              role: doc.role ?? m.role,
              status: doc.status ?? m.status,
            }
          : m
      ),
    }));
    get()._syncOnlineMembers();
  },

  removeGlobalTeamMember: async (memberId: string) => {
    await removeMemberFromProjectDb(memberId);
    set((state) => ({
      globalTeamMembers: state.globalTeamMembers.filter(
        (m: TeamMember) => m.id !== memberId
      ),
      projects: state.projects.map((proj) => ({
        ...proj,
        collaborators: (proj.collaborators || []).filter(
          (id: string) => id !== memberId
        ),
      })),
    }));
    get()._syncOnlineMembers();
  },

  setMemberStatus: async (memberId: string, status: TeamMember["status"]) => {
    await setMemberStatusDb(memberId, status);
    set((state) => ({
      globalTeamMembers: state.globalTeamMembers.map((m: TeamMember) =>
        m.id === memberId ? { ...m, status } : m
      ),
    }));
    get()._syncOnlineMembers();
  },

  // ---------- Realtime ----------
  startTeamRealtime: () => {
    const existing = get()._tmUnsub;
    if (existing) try { existing(); } catch {}

    const unsub = subscribeTeamMembers((event: any) => {
      const events: string[] = event?.events || [];
      const d = event?.payload;
      if (!d) return;

      if (events.some((e) => e.endsWith(".create"))) {
        set((state) => {
          if (state.globalTeamMembers.some((m: TeamMember) => m.id === d.$id))
            return state;
          return {
            globalTeamMembers: [
              ...state.globalTeamMembers,
              {
                id: d.$id,
                name: d.name,
                email: d.email,
                role: d.role,
                createdAt: d.createdAt,
                status: d.status || "offline",
              },
            ],
          };
        });
        get()._syncOnlineMembers();
        return;
      }

      if (events.some((e) => e.endsWith(".update"))) {
        set((state) => ({
          globalTeamMembers: state.globalTeamMembers.map((m: TeamMember) =>
            m.id === d.$id
              ? {
                  id: d.$id,
                  name: d.name,
                  email: d.email,
                  role: d.role,
                  createdAt: d.createdAt,
                  status: d.status || "offline",
                }
              : m
          ),
        }));
        get()._syncOnlineMembers();
        return;
      }

      if (events.some((e) => e.endsWith(".delete"))) {
        set((state) => ({
          globalTeamMembers: state.globalTeamMembers.filter(
            (m: TeamMember) => m.id !== d.$id
          ),
        }));
        get()._syncOnlineMembers();
      }
    });

    set({ _tmUnsub: unsub });
  },

  stopTeamRealtime: () => {
    const existing = get()._tmUnsub;
    if (existing) try { existing(); } catch {}
    set({ _tmUnsub: null });
  },

  startProjectMembersRealtime: (projectId: string) => {
    const existing = get()._pmUnsub;
    if (existing) try { existing(); } catch {}
    const unsub = subscribeProjectMembers(projectId, async () => {
      const docs = await listProjectMembers(projectId);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.$id === projectId
            ? { ...p, collaborators: docs.map((d: any) => d.memberId) }
            : p
        ),
      }));
    });
    set({ _pmUnsub: unsub });
  },

  stopProjectMembersRealtime: () => {
    const existing = get()._pmUnsub;
    if (existing) try { existing(); } catch {}
    set({ _pmUnsub: null });
  },
}));
