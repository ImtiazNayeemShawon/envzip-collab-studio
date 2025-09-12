// envVariableService.js - Updated with better real-time handling
import { ID, Query } from "appwrite";
import database, { client } from "./appwritedb"; // ensure client is imported
import authService from "./auth"; // your auth helper
import {
    createInitialVersion,
    createVersionOnUpdate,
    createVersionOnDelete
} from "./versionHandler";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = "envVariables"; // Collection/Table for Environment Variables

// 🔹 Helper: Safe JSON parse
function safeParse(value, fallback) {
    try {
        if (!value) return fallback;
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
        return fallback;
    }
}

// Get current user - moved inside functions to avoid top-level await
async function getCurrentUser() {
    try {
        return await authService.getCurrentUser();
    } catch (error) {
        console.error("❌ Error getting current user:", error);
        return null;
    }
}

// ✅ Create an Environment Variable
export async function createEnvVariable(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not logged in");

        const envVariable = await database.createDocument(
            databaseId,
            tableId,
            ID.unique(),
            {
                ...data,
                lastUpdatedBy: currentUser?.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
        
        // Create initial version
        try {
            await createInitialVersion(envVariable, "✅ Initial version");
            console.log("✅ Initial version created for environment variable");
        } catch (versionError) {
            console.error("⚠️ Environment variable created but version failed:", versionError);
        }

        return {
            ...envVariable,
            tags: safeParse(envVariable.tags, []),
        };
    } catch (error) {
        console.error("❌ Error creating env variable:", error);
        throw error;
    }
}

// ✅ Read environment variables for a given project
export async function getEnvVariablesByProject(projectId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not logged in");

        const queries = [Query.equal("projectId", projectId)];
        const response = await database.listDocuments(databaseId, tableId, queries);

        const variables = response.documents.map((doc) => ({
            ...doc,
            tags: safeParse(doc.tags, []),
        }));

        return variables;
    } catch (error) {
        console.error("❌ Error fetching env variables:", error);
        throw error;
    }
}

// ✅ Get single environment variable by ID
export async function getEnvVariableById(variableId) {
    try {
        const envVariable = await database.getDocument(databaseId, tableId, variableId);

        return {
            ...envVariable,
            tags: safeParse(envVariable.tags, []),
        };
    } catch (error) {
        console.error("❌ Error fetching env variable:", error);
        throw error;
    }
}

// ✅ Update an Environment Variable
export async function updateEnvVariable(variableId, updates) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not logged in");

        // Get the current version before updating
        const oldEnvVariable = await database.getDocument(databaseId, tableId, variableId);

        const envVariable = await database.updateDocument(
            databaseId,
            tableId,
            variableId,
            {
                ...updates,
                lastUpdatedBy: currentUser?.name,
                updatedAt: new Date().toISOString(),
            }
        );
        
        // Create version for the update
        try {
            await createVersionOnUpdate(oldEnvVariable, envVariable);
            console.log("✅ Update version created for environment variable");
        } catch (versionError) {
            console.error("⚠️ Environment variable updated but version failed:", versionError);
        }
        
        return {
            ...envVariable,
            tags: safeParse(envVariable.tags, []),
        };
    } catch (error) {
        console.error("❌ Error updating env variable:", error);
        throw error;
    }
}

// ✅ Delete an Environment Variable
export async function deleteEnvVariable(variableId) {
    try {
        // Get the environment variable before deleting
        const envVariable = await database.getDocument(databaseId, tableId, variableId);

        // Create version for the deletion BEFORE deleting
        try {
            await createVersionOnDelete(envVariable);
            console.log("✅ Delete version created for environment variable");
        } catch (versionError) {
            console.error("⚠️ Version creation failed before deletion:", versionError);
        }
        
        await database.deleteDocument(databaseId, tableId, variableId);
        return true;
    } catch (error) {
        console.error("❌ Error deleting env variable:", error);
        throw error;
    }
}

// ✅ Enhanced Realtime subscribe for env variables by project
export function subscribeEnvVariables(projectId, onEvent) {
    if (!databaseId || !projectId || !client) {
        console.error("❌ Missing required parameters for real-time subscription");
        return () => {};
    }

    const collectionId = "envVariables";
    const topic = `databases.${databaseId}.collections.${collectionId}.documents`;

    console.log(`🔄 Starting real-time subscription for project: ${projectId}`);
    console.log(`📡 Topic: ${topic}`);

    try {
        const unsubscribe = client.subscribe(topic, (response) => {
            try {
                console.log("🔄 Real-time event received:", response);
                
                const payload = response?.payload;
                const events = response?.events || [];
                
                if (!payload) {
                    console.warn("⚠️ No payload in real-time event");
                    return;
                }

                // Only forward events for this specific project
                if (payload.projectId !== projectId) {
                    console.log(`🔄 Event for different project (${payload.projectId}), ignoring`);
                    return;
                }

                console.log(`✅ Processing event for project ${projectId}:`, events);
                
                // Normalize the payload
                const normalizedPayload = {
                    ...payload,
                    tags: safeParse(payload.tags, []),
                };

                // Call the event handler with normalized data
                onEvent?.({
                    ...response,
                    payload: normalizedPayload
                });
                
            } catch (error) {
                console.error("❌ Real-time handler error:", error);
            }
        });

        console.log("✅ Real-time subscription established");
        return unsubscribe;
        
    } catch (error) {
        console.error("❌ Failed to establish real-time subscription:", error);
        return () => {};
    }
}