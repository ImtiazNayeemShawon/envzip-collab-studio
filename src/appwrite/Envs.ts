// envService.js
import { ID, Query } from "appwrite";
import database from "./appwritedb";
import authService from "./auth";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = "envVariables";

// 🔹 Helper: Safe JSON parse
function safeParse(value, fallback) {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// 🔹 Current user
const currentUser = await authService.getCurrentUser(); // returns user object

// ✅ Create an Env Variable
export async function createEnvVariable(data) {
  try {
    if (!currentUser) throw new Error("User not logged in");

    const envVar = await database.createDocument(
      databaseId,
      tableId,
      ID.unique(),
      {
        ...data,
        lastUpdatedBy: currentUser?.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return envVar;
  } catch (error) {
    console.error("❌ Error creating env variable:", error);
    throw error;
  }
}

// ✅ Get all env variables for a project
export async function getEnvVariables(projectId) {
  try {
    if (!currentUser) throw new Error("User not logged in");
    if (!projectId) throw new Error("Project ID required");

    const response = await database.listDocuments(databaseId, tableId, [
      Query.equal("projectId", projectId),
    ]);

    const envVars = response.documents.map((doc) => ({
      ...doc,
      tags: safeParse(doc.tags, []),
    }));

    return envVars;
  } catch (error) {
    console.error("❌ Error fetching env variables:", error);
    throw error;
  }
}

// ✅ Get single env variable by ID
export async function getEnvVariableById(envId) {
  try {
    const envVar = await database.getDocument(databaseId, tableId, envId);

    return {
      ...envVar,
      tags: safeParse(envVar.tags, []),
    };
  } catch (error) {
    console.error("❌ Error fetching env variable:", error);
    throw error;
  }
}

// ✅ Update an Env Variable
export async function updateEnvVariable(envId, updates) {
  try {
    if (!currentUser) throw new Error("User not logged in");

    const envVar = await database.updateDocument(
      databaseId,
      tableId,
      envId,
      {
        ...updates,
        lastUpdatedBy: currentUser?.$id,
        updatedAt: new Date().toISOString(),
      }
    );

    return envVar;
  } catch (error) {
    console.error("❌ Error updating env variable:", error);
    throw error;
  }
}

// ✅ Delete an Env Variable
export async function deleteEnvVariable(envId) {
  try {
    await database.deleteDocument(databaseId, tableId, envId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting env variable:", error);
    throw error;
  }
}
