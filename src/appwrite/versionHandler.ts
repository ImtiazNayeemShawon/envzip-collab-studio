// versioningService.js
import { ID, Query } from "appwrite";
import database from "./appwritedb";
import authService from "./auth";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const versionsTableId = "versions";
const envVariablesTableId = "envVariables";

// Get current user
async function getCurrentUser() {
  try {
    return await authService.getCurrentUser();
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    return null;
  }
}

// 🔹 Helper: Calculate changes between old and new values
function calculateChanges(oldEnvVar, newEnvVar) {
  const changes = [];
  const fieldsToCheck = ['key', 'value', 'description', 'type', 'environment'];

  fieldsToCheck.forEach(field => {
    const oldValue = oldEnvVar?.[field];
    const newValue = newEnvVar?.[field];

    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue: oldValue ?? null,
        newValue: newValue ?? null,
        changeType: oldValue === undefined ? 'added' : 'modified'
      });
    }
  });

  return changes;
}


// 🔹 Helper: Get next version number for an environment variable
async function getNextVersionNumber(envVariableId) {
  try {
    const queries = [
      Query.equal("envVariableId", envVariableId),
      Query.orderDesc("versionNumber"),
      Query.limit(1)
    ];

    const response = await database.listDocuments(databaseId, versionsTableId, queries);

    if (response.documents.length === 0) {
      return 1; // First version
    }

    return response.documents[0].versionNumber + 1;
  } catch (error) {
    console.error("❌ Error getting next version number:", error);
    return 1;
  }
}

// ✅ Create a new version when environment variable is created
export async function createInitialVersion(envVariable, message = "Initial version") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not logged in");

    const changes = [{
      field: 'created',
      oldValue: null,
      newValue: {
        key: envVariable.key,
        value: envVariable.value,
        description: envVariable.description,
        type: envVariable.type,
        environment: envVariable.environment
      },
      changeType: 'created'
    }];

    const version = await database.createDocument(
      databaseId,
      versionsTableId,
      ID.unique(),
      {
        versionId: ID.unique(),
        envVariableId: envVariable.$id || envVariable.id,
        projectId: envVariable.projectId,
        environment: envVariable.environment,
        versionNumber: 1,
        changes: JSON.stringify(changes),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        message
      }
    );

    return version;
  } catch (error) {
    console.error("❌ Error creating initial version:", error);
    throw error;
  }
}

// ✅ Create a new version when environment variable is updated
export async function createVersionOnUpdate(oldEnvVar, newEnvVar, message = "Variable updated") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not logged in");

    // Calculate what changed
    const changes = calculateChanges(oldEnvVar, newEnvVar);
    console.log({
      old: oldEnvVar,
      new: newEnvVar
    })

    // Only create version if there are actual changes
    if (changes.length === 0) {
      console.log("No changes detected, skipping version creation");
      return null;
    }

    const nextVersionNumber = await getNextVersionNumber(newEnvVar.$id || newEnvVar.$id);

    const version = await database.createDocument(
      databaseId,
      versionsTableId,
      ID.unique(),
      {
        versionId: ID.unique(),
        envVariableId: newEnvVar.$id || newEnvVar.id,
        projectId: newEnvVar.projectId,
        environment: newEnvVar.environment,
        versionNumber: nextVersionNumber,
        changes: JSON.stringify(changes),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        message
      }
    );

    return version;
  } catch (error) {
    console.error("❌ Error creating update version:", error);
    throw error;
  }
}

// ✅ Create a version when environment variable is deleted
export async function createVersionOnDelete(envVariable, message = "Variable deleted") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not logged in");

    const changes = [{
      field: 'deleted',
      oldValue: {
        key: envVariable.key,
        value: envVariable.value,
        description: envVariable.description,
        type: envVariable.type,
        environment: envVariable.environment
      },
      newValue: null,
      changeType: 'deleted'
    }];

    const nextVersionNumber = await getNextVersionNumber(envVariable.$id || envVariable.id);

    const version = await database.createDocument(
      databaseId,
      versionsTableId,
      ID.unique(),
      {
        versionId: ID.unique(),
        envVariableId: envVariable.$id || envVariable.id,
        projectId: envVariable.projectId,
        environment: envVariable.environment,
        versionNumber: nextVersionNumber,
        changes: JSON.stringify(changes),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        message
      }
    );

    return version;
  } catch (error) {
    console.error("❌ Error creating delete version:", error);
    throw error;
  }
}

// ✅ Get version history for a specific environment variable
export async function getVersionHistory(projectId) {
  try {
    const queries = [
      Query.equal("projectId", projectId),
      Query.orderDesc("versionNumber")
    ];

    const response = await database.listDocuments(databaseId, versionsTableId, queries);

    // Parse changes back to objects and add user info
    const versions = response.documents.map(version => ({
      ...version,
      changes: JSON.parse(version.changes || '[]'),
      // You might want to fetch user details here
    }));

    return versions;
  } catch (error) {
    console.error("❌ Error fetching version history:", error);
    throw error;
  }
}

// ✅ Get version history for all variables in a project
export async function getProjectVersionHistory(projectId, limit = 50) {
  try {
    const queries = [
      Query.equal("projectId", projectId),
      Query.orderDesc("createdAt"),
      Query.limit(limit)
    ];

    const response = await database.listDocuments(databaseId, versionsTableId, queries);

    const versions = response.documents.map(version => ({
      ...version,
      changes: JSON.parse(version.changes || '[]'),
    }));

    return versions;
  } catch (error) {
    console.error("❌ Error fetching project version history:", error);
    throw error;
  }
}

// ✅ Get version history for a specific environment in a project
export async function getEnvironmentVersionHistory(projectId, environment, limit = 50) {
  try {
    const queries = [
      Query.equal("projectId", projectId),
      Query.equal("environment", environment),
      Query.orderDesc("createdAt"),
      Query.limit(limit)
    ];

    const response = await database.listDocuments(databaseId, versionsTableId, queries);

    const versions = response.documents.map(version => ({
      ...version,
      changes: JSON.parse(version.changes || '[]'),
    }));

    return versions;
  } catch (error) {
    console.error("❌ Error fetching environment version history:", error);
    throw error;
  }
}

// ✅ Get a specific version by ID
export async function getVersionById(versionId) {
  try {
    console.log("checking for version", versionId);
    // Query for the document where versionId field matches
    const queries = [Query.equal("versionId", versionId), Query.limit(1)];
    const response = await database.listDocuments(databaseId, versionsTableId, queries);
    console.log("response", response);

    if (!response.documents.length) {
      throw new Error(`Version with versionId ${versionId} not found`);
    }

    const version = response.documents[0];

    return {
      ...version,
      changes: JSON.parse(version.changes || '[]'),
    };
  } catch (error) {
    console.error("❌ Error fetching version:", error);
    throw error;
  }
}

// ✅ Get version statistics for a project
export async function getVersionStatistics(projectId) {
  try {
    const queries = [Query.equal("projectId", projectId)];
    const response = await database.listDocuments(databaseId, versionsTableId, queries);

    const stats = {
      totalVersions: response.documents.length,
      versionsByEnvironment: {
        development: 0,
        staging: 0,
        production: 0
      },
      changeTypes: {
        created: 0,
        modified: 0,
        deleted: 0
      },
      recentActivity: []
    };

    response.documents.forEach(version => {
      // Count by environment
      stats.versionsByEnvironment[version.environment]++;

      // Count change types
      const changes = JSON.parse(version.changes || '[]');
      changes.forEach(change => {
        stats.changeTypes[change.changeType] = (stats.changeTypes[change.changeType] || 0) + 1;
      });
    });

    // Get recent activity (last 10 versions)
    const recentQueries = [
      Query.equal("projectId", projectId),
      Query.orderDesc("createdAt"),
      Query.limit(10)
    ];
    const recentResponse = await database.listDocuments(databaseId, versionsTableId, recentQueries);

    stats.recentActivity = recentResponse.documents.map(version => ({
      ...version,
      changes: JSON.parse(version.changes || '[]'),
    }));

    return stats;
  } catch (error) {
    console.error("❌ Error fetching version statistics:", error);
    throw error;
  }
}

