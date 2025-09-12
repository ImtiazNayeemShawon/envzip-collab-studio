import { ID, Query } from "appwrite";
import database, { client } from "./appwritedb";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const teamMembersTableId = "teamMembers";
const projectMembersTableId = "projectMembers";
import authService from "./auth"; // your auth helper



// ------------ Team Members CRUD ------------
export async function listTeamMembers() {
  const currentUser = await authService.getCurrentUser(); // should return userId

  const res = await database.listDocuments(databaseId, teamMembersTableId, [
    Query.equal("addedBy", currentUser?.$id),
  ]);
  return res.documents;
}

export async function createTeamMember(data: {
  name: string;
  email: string;
  role: "admin" | "member";
  status?: "online" | "offline" | "away";
}) {
  const currentUser = await authService.getCurrentUser(); // should return userId

  const doc = await database.createDocument(databaseId, teamMembersTableId, ID.unique(), {
    ...data,
    addedBy: currentUser?.$id,
    status: data.status || "offline",
  });
  return doc;
}

export async function updateTeamMember(memberId: string, updates: Partial<{ name: string; email: string; role: "owner" | "admin" | "member"; status: "online" | "offline" | "away"; }>) {
  const doc = await database.updateDocument(databaseId, teamMembersTableId, memberId, updates as any);
  return doc;
}



export async function setMemberStatus(memberId: string, status: "online" | "offline" | "away") {
  const doc = await database.updateDocument(databaseId, teamMembersTableId, memberId, { status });
  return doc;
}



export async function removeMemberFromProjectDb(projectId: string, memberId: string) {
  
  // find the join doc and delete
  const res = await database.listDocuments(databaseId, projectMembersTableId, [
    Query.equal("projectId", projectId),
    Query.equal("memberId", memberId),
    Query.limit(1),
  ]);
  if (res.documents.length) {
    await database.deleteDocument(databaseId, projectMembersTableId, res.documents[0].$id);
  }
  return true;
}

export async function listProjectMembers(projectId: string) {
  const res = await database.listDocuments(databaseId, projectMembersTableId, [
    Query.equal("projectId", projectId),
  ]);
  return res.documents;
}

// ------------ Realtime ------------
export function subscribeTeamMembers(onEvent: (e: any) => void) {
  const topic = `databases.${databaseId}.collections.${teamMembersTableId}.documents`;
  return client.subscribe(topic, (event) => onEvent?.(event));
}

export function subscribeProjectMembers(projectId: string, onEvent: (e: any) => void) {
  const topic = `databases.${databaseId}.collections.${projectMembersTableId}.documents`;
  return client.subscribe(topic, (event) => {
    const payload = event?.payload;
    if (!payload) return;
    if (payload.projectId !== projectId) return;
    onEvent?.(event);
  });
}
