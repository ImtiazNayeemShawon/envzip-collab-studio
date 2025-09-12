// useEnvVariableStore.js - Enhanced with better real-time handling
import { create } from "zustand";
import {
    createEnvVariable,
    getEnvVariablesByProject,
    getEnvVariableById,
    updateEnvVariable,
    deleteEnvVariable,
    subscribeEnvVariables,
} from "../appwrite/envhandler";

const useEnvVariableStore = create((set, get) => ({
    envVariables: [],
    loading: false,
    error: null,
    _unsubscribe: null,
    _currentProjectId: null,

    // ✅ Fetch all variables for a project
    fetchEnvVariables: async (projectId) => {
        set({ loading: true, error: null });
        try {
            console.log(`🔄 Fetching env variables for project: ${projectId}`);
            const variables = await getEnvVariablesByProject(projectId);
            console.log(`✅ Fetched ${variables.length} environment variables`);
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

            // Merge into store
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
            console.log("🔄 Creating new environment variable:", data.name);
            const newVar = await createEnvVariable(data);
            
            // Note: Real-time will handle adding to store, but add manually as fallback
            set((state) => {
                const exists = state.envVariables.some(v => v.$id === newVar.$id);
                if (!exists) {
                    console.log("✅ Adding new variable to local store");
                    return {
                        envVariables: [...state.envVariables, newVar],
                        loading: false,
                    };
                }
                return { loading: false };
            });
            
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
            console.log(`🔄 Updating environment variable: ${variableId}`);
            const updated = await updateEnvVariable(variableId, updates);
            
            // Note: Real-time will handle updating store, but update manually as fallback
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
            console.log(`🔄 Deleting environment variable: ${variableId}`);
            await deleteEnvVariable(variableId);
            
            // Note: Real-time will handle removing from store, but remove manually as fallback
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

    // ✅ Enhanced real-time subscription
    startRealtime: (projectId) => {
        const state = get();
        
        // Stop existing subscription if switching projects
        if (state._unsubscribe && state._currentProjectId !== projectId) {
            console.log(`🔄 Switching real-time from project ${state._currentProjectId} to ${projectId}`);
            try { 
                state._unsubscribe(); 
            } catch (error) {
                console.error("⚠️ Error stopping previous subscription:", error);
            }
            set({ _unsubscribe: null, _currentProjectId: null });
        }

        // Don't start if already subscribed to this project
        if (state._unsubscribe && state._currentProjectId === projectId) {
            console.log(`✅ Already subscribed to project ${projectId}`);
            return;
        }

        console.log(`🔄 Starting real-time subscription for project: ${projectId}`);

        const unsubscribe = subscribeEnvVariables(projectId, (event) => {
            const events = event?.events || [];
            const doc = event?.payload;
            
            if (!doc) {
                console.warn("⚠️ No document in real-time event");
                return;
            }

            console.log("🔄 Processing real-time event:", events, doc.name || doc.$id);

            // Handle CREATE events
            if (events.some((e) => e.endsWith(".create"))) {
                console.log("✅ Real-time CREATE:", doc.name);
                set((state) => {
                    const exists = state.envVariables.some((v) => v.$id === doc.$id);
                    if (!exists) {
                        return { 
                            envVariables: [...state.envVariables, doc],
                            error: null 
                        };
                    }
                    return state;
                });
                return;
            }

            // Handle UPDATE events
            if (events.some((e) => e.endsWith(".update"))) {
                console.log("✅ Real-time UPDATE:", doc.name);
                set((state) => ({
                    envVariables: state.envVariables.map((v) => 
                        v.$id === doc.$id ? doc : v
                    ),
                    error: null
                }));
                return;
            }

            // Handle DELETE events
            if (events.some((e) => e.endsWith(".delete"))) {
                console.log("✅ Real-time DELETE:", doc.$id);
                set((state) => ({
                    envVariables: state.envVariables.filter((v) => v.$id !== doc.$id),
                    error: null
                }));
                return;
            }
        });

        set({ 
            _unsubscribe: unsubscribe,
            _currentProjectId: projectId 
        });
        
        console.log(`✅ Real-time subscription established for project: ${projectId}`);
    },

    // ✅ Stop real-time subscription
    stopRealtime: () => {
        const state = get();
        if (state._unsubscribe) {
            console.log(`🔄 Stopping real-time subscription for project: ${state._currentProjectId}`);
            try { 
                state._unsubscribe(); 
            } catch (error) {
                console.error("⚠️ Error stopping subscription:", error);
            }
            set({ 
                _unsubscribe: null,
                _currentProjectId: null 
            });
            console.log("✅ Real-time subscription stopped");
        }
    },

    // ✅ Clear store (useful when switching projects)
    clearStore: () => {
        console.log("🧹 Clearing environment variables store");
        set({ 
            envVariables: [],
            loading: false,
            error: null 
        });
    },

    // ✅ Refresh data (useful for manual refresh)
    refresh: async (projectId) => {
        if (!projectId) {
            console.warn("⚠️ No project ID provided for refresh");
            return;
        }
        console.log(`🔄 Refreshing environment variables for project: ${projectId}`);
        await get().fetchEnvVariables(projectId);
    },
}));

export default useEnvVariableStore;