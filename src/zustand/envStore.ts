// useEnvVariableStore.js
import { create } from "zustand";
import {
    createEnvVariable,
    getEnvVariablesByProject,
    getEnvVariableById,
    updateEnvVariable,
    deleteEnvVariable,
} from "../appwrite/envhandler";

const useEnvVariableStore = create<any>((set, get) => ({
    envVariables: [],   // local cache of environment variables
    loading: false,
    error: null,

    // ✅ Fetch all variables for a project
    fetchEnvVariables: async (projectId) => {
        set({ loading: true, error: null });
        try {
            const variables = await getEnvVariablesByProject(projectId);
            set({ envVariables: variables, loading: false });
        } catch (err) {
            console.error("❌ Failed to fetch env variables:", err);
            set({ error: err.message, loading: false });
        }
    },

    // ✅ Get single variable (from store or fetch fresh)
    fetchEnvVariable: async (variableId) => {
        set({ loading: true, error: null });
        try {
            const variable = await getEnvVariableById(variableId);

            // merge into store
            set((state) => ({
                envVariables: [
                    ...state.envVariables.filter((v) => v.$id !== variable.$id),
                    variable,
                ],
                loading: false,
            }));

            return variable;
        } catch (err) {
            console.error("❌ Failed to fetch env variable:", err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ✅ Create new variable
    addEnvVariable: async (data) => {
        set({ loading: true, error: null });
        try {
            const newVar = await createEnvVariable(data);
            set((state) => ({
                envVariables: [...state.envVariables, newVar],
                loading: false,
            }));
            return newVar;
        } catch (err) {
            console.error("❌ Failed to create env variable:", err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ✅ Update variable
    updateEnvVariable: async (variableId, updates) => {
        
        set({ loading: true, error: null });
        try {
            const updated = await updateEnvVariable(variableId, updates);
            set((state) => ({
                envVariables: state.envVariables.map((v) =>
                    v.$id === variableId ? updated : v
                ),
                loading: false,
            }));
            return updated;
        } catch (err) {
            console.error("❌ Failed to update env variable:", err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    // ✅ Delete variable
    deleteEnvVariable: async (variableId) => {
        set({ loading: true, error: null });
        try {
            await deleteEnvVariable(variableId);
            set((state) => ({
                envVariables: state.envVariables.filter((v) => v.$id !== variableId),
                loading: false,
            }));
            return true;
        } catch (err) {
            console.error("❌ Failed to delete env variable:", err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },
}));

export default useEnvVariableStore;
