// envVariableService.js
import { ID, Query } from "appwrite";
import database from "./appwritedb";
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

const currentUser = await authService.getCurrentUser(); // should return userId

// ✅ Create an Environment Variable
export async function createEnvVariable(data) {
    try {
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
            // Don't throw here, the env variable was created successfully
        }

        return {
            ...envVariable,
        };
    } catch (error) {
        console.error("❌ Error creating env variable:", error);
        throw error;
    }
}

// ✅ Read environment variables for a given project
export async function getEnvVariablesByProject(projectId) {
    try {
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
            // Don't throw here, the update was successful
        }
        return {
            ...envVariable,
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
            // Continue with deletion anyway
        }
        await database.deleteDocument(databaseId, tableId, variableId);
        return true;
    } catch (error) {
        console.error("❌ Error deleting env variable:", error);
        throw error;
    }
}

// ✅ Rollback an Environment Variable to a previous version
export async function rollbackEnvVariable(variableId, versionData) {
    try {
        // Get current environment variable
        const currentEnvVariable = await database.getDocument(databaseId, tableId, variableId);

        // Prepare rollback data
        // versionData should contain the full state of the env variable to rollback to
        const rollbackData = {
            key: versionData.key,
            value: versionData.value,
            description: versionData.description,
            environment: versionData.environment,
            tags: versionData.tags ? JSON.stringify(versionData.tags) : "[]",
            lastUpdatedBy: currentUser?.name,
            updatedAt: new Date().toISOString(),
        };

        // Update the environment variable with rollback data
        const updatedEnvVariable = await database.updateDocument(
            databaseId,
            tableId,
            variableId,
            rollbackData
        );

        // Create a version entry for the rollback
        try {
            await createVersionOnUpdate(currentEnvVariable, updatedEnvVariable);
            console.log("✅ Rollback version created for environment variable");
        } catch (versionError) {
            console.error("⚠️ Rollback succeeded but version creation failed:", versionError);
        }

        return updatedEnvVariable;
    } catch (error) {
        console.error("❌ Error rolling back env variable:", error);
        throw error;
    }
}
