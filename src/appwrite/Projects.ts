// projectService.js
import { ID, Query } from "appwrite";
import database from "./appwritedb";
import authService from "./auth"; // your auth helper

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = "projects"; // Collection/Table for Projects

// 🔹 Helper: Safe JSON parse
function safeParse(value, fallback) {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

const currentUser = await authService.getCurrentUser(); // should return userId

// ✅ Create a Project (ownerId automatically assigned)
export async function createProject(data) {
  try {

    if (!currentUser) throw new Error("User not logged in");

    const project = await database.createDocument(
      databaseId,
      tableId,
      ID.unique(),
      {
        ...data,
        ownerId: currentUser?.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    return project;
  } catch (error) {
    console.error("❌ Error creating project:", error);
    throw error;
  }
}

// ✅ Read projects for current user automatically
export async function getProjects() {
  try {
    if (!currentUser) throw new Error("User not logged in");

    const queries = [Query.equal("ownerId", currentUser?.$id)];
    const response = await database.listDocuments(databaseId, tableId, queries);

    // Parse JSON-like fields safely
    const projects = response.documents.map((doc) => ({
      ...doc,
      environments: safeParse(doc.environments, []),
      collaborators: safeParse(doc.collaborators, []),
      settings: safeParse(doc.settings, {}),
    }));

    return projects;
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    throw error;
  }
}

// ✅ Get single project by ID
export async function getProjectById(projectId) {
  try {
    const project = await database.getDocument(databaseId, tableId, projectId);

    return {
      ...project,
      environments: safeParse(project.environments, []),
      collaborators: safeParse(project.collaborators, []),
      settings: safeParse(project.settings, {}),
    };
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    throw error;
  }
}

// ✅ Update a Project
export async function updateProject(projectId, updates) {
  try {
    const project = await database.updateDocument(
      databaseId,
      tableId,
      projectId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
    return project;
  } catch (error) {
    console.error("❌ Error updating project:", error);
    throw error;
  }
}

// ✅ Delete a Project
export async function deleteProject(projectId) {
  try {
    await database.deleteDocument(databaseId, tableId, projectId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    throw error;
  }
}
