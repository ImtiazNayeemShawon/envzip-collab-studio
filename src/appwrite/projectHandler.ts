// projectService.js
import { ID, Query } from "appwrite";
import database from "./appwritedb";
import authService from "./auth";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = "projects";

// 🔹 Helper: Safe JSON parse
function safeParse<T>(value: any, fallback: T): T {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// 🔹 Helper: Check if user has access to project (owner or collaborator)
async function checkProjectAccess(projectId, requireOwner = false) {
  const currentUser = await authService.getCurrentUser();
  if (!currentUser) throw new Error("User not logged in");

  const project = await database.getDocument(databaseId, tableId, projectId);
  const collaborators = safeParse(project.collaborators, []);
  
  const isOwner = project.ownerId === currentUser.$id;
  const isCollaborator = collaborators.includes(currentUser.email);
  
  if (requireOwner && !isOwner) {
    throw new Error("Only project owner can perform this action");
  }
  
  if (!isOwner && !isCollaborator) {
    throw new Error("Access denied: You are not a collaborator on this project");
  }
  
  return { project, isOwner, isCollaborator };
}

// ✅ Create a Project (ownerId automatically assigned)
export async function createProject(data) {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) throw new Error("User not logged in");

    const project = await database.createDocument(
      databaseId,
      tableId,
      ID.unique(),
      {
        ...data,
        ownerId: currentUser.$id,
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

// ✅ Read projects for current user (owned + collaborated)
export async function getProjects() {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) throw new Error("User not logged in");

    // Step 1: Get ALL projects first (we'll filter client-side)
    // This is more efficient than trying to query with complex conditions
    const allProjectsResponse = await database.listDocuments(databaseId, tableId, []);

    // Step 2: Filter projects where user is owner OR collaborator
    const projects = allProjectsResponse.documents
      .map(doc => ({
        ...doc,
        settings: safeParse(doc.settings, {}),
        collaborators: safeParse(doc.collaborators, []),
      }))
      .filter(project => {
        const isOwner = project.ownerId === currentUser.$id;
        const isCollaborator = project.collaborators.includes(currentUser.email);
        return isOwner || isCollaborator;
      })
      .map(project => ({
        ...project,
        isOwner: project.ownerId === currentUser.$id
      }));

    const projectIds = projects.map((p) => p.$id);

    if (projectIds.length > 0) {
      // Step 2: Fetch env variables where projectId IN projectIds
      const envResponse = await database.listDocuments(databaseId, "envVariables", [
        Query.equal("projectId", projectIds),
      ]);

      // Group envs by projectId
      const envMap = envResponse.documents.reduce((acc, env) => {
        if (!acc[env.projectId]) acc[env.projectId] = [];
        acc[env.projectId].push(env);
        return acc;
      }, {} as Record<string, any[]>);

      // Step 3: Attach counts & latest 3 envs
      projects.forEach((project) => {
        const envs = envMap[project.$id] || [];
        project.envCount = envs.length;
        project.latestEnvs = envs.slice(0, 3);
      });
    }

    return projects;
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    throw error;
  }
}

// ✅ Get single project by ID (with access check)
export async function getProjectById(projectId) {
  try {
    const { project } = await checkProjectAccess(projectId);

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

// ✅ Update a Project (collaborators can update)
export async function updateProject(projectId, updates) {
  try {
    // Check access (both owners and collaborators can update)
    await checkProjectAccess(projectId);

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

// ✅ Add collaborator (only owner can add collaborators)
export async function addCollaboratorToProject(projectId, collaboratorEmail) {
  try {
    // Only owner can add collaborators
    const { project } = await checkProjectAccess(projectId, true);

    // Parse stored collaborators
    let collaborators: string[] = safeParse(project.collaborators, []);

    // Prevent duplicates
    if (collaborators.includes(collaboratorEmail)) {
      return true; // already exists
    }

    // Append new collaborator
    collaborators.push(collaboratorEmail);

    // Save back as JSON string
    await database.updateDocument(databaseId, tableId, projectId, {
      collaborators: JSON.stringify(collaborators),
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("❌ Error adding collaborator to project:", error);
    return false;
  }
}

// ✅ Delete collaborator (only owner can remove collaborators)
export async function deleteCollaborator(projectId, email) {
  try {
    // Only owner can remove collaborators
    const { project } = await checkProjectAccess(projectId, true);

    // Parse and filter collaborators
    const collaborators = safeParse(project.collaborators, []);
    const updatedCollaborators = collaborators.filter(
      (collaborator) => collaborator !== email
    );

    // Update the document
    await database.updateDocument(databaseId, tableId, projectId, {
      collaborators: JSON.stringify(updatedCollaborators),
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("❌ Error deleting collaborator:", error);
    return false;
  }
}

// ✅ Delete a Project (ONLY OWNER can delete)
export async function deleteProject(projectId) {
  try {
    // Only owner can delete projects
    await checkProjectAccess(projectId, true);
    
    await database.deleteDocument(databaseId, tableId, projectId);
    return true;
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    throw error;
  }
}

// ✅ Check if current user can perform admin actions (only owner)
export async function canPerformAdminActions(projectId) {
  try {
    const { isOwner } = await checkProjectAccess(projectId);
    return isOwner;
  } catch {
    return false;
  }
}

// ✅ Get user's role in project
export async function getUserProjectRole(projectId) {
  try {
    const { isOwner } = await checkProjectAccess(projectId);
    return isOwner ? 'owner' : 'collaborator';
  } catch {
    return null;
  }
}