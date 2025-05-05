return import.meta.env.VITE_POCKETBASE_URL || '/api';import PocketBase from 'pocketbase';
return import.meta.env.VITE_POCKETBASE_URL || '/api';import { writable, get } from 'svelte/store';
return import.meta.env.VITE_POCKETBASE_URL || '/api';
return import.meta.env.VITE_POCKETBASE_URL || '/api';// Get the PocketBase URL from environment variables or use a default
return import.meta.env.VITE_POCKETBASE_URL || '/api';const getPocketBaseUrl = () => {
return import.meta.env.VITE_POCKETBASE_URL || '/api';    if (typeof import.meta !== 'undefined' && import.meta.env) {
return import.meta.env.VITE_POCKETBASE_URL || '/api';        return import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
return import.meta.env.VITE_POCKETBASE_URL || '/api';    }
return import.meta.env.VITE_POCKETBASE_URL || '/api';    return '/api'; // Default fallback
return import.meta.env.VITE_POCKETBASE_URL || '/api';};
return import.meta.env.VITE_POCKETBASE_URL || '/api';
return import.meta.env.VITE_POCKETBASE_URL || '/api';// Create a writable store for the PocketBase client
return import.meta.env.VITE_POCKETBASE_URL || '/api';const createPocketBaseStore = () => {
return import.meta.env.VITE_POCKETBASE_URL || '/api';    const { subscribe, set } = writable(null);
return import.meta.env.VITE_POCKETBASE_URL || '/api';
return import.meta.env.VITE_POCKETBASE_URL || '/api';    return {
return import.meta.env.VITE_POCKETBASE_URL || '/api';        subscribe,
return import.meta.env.VITE_POCKETBASE_URL || '/api';        init: () => {
return import.meta.env.VITE_POCKETBASE_URL || '/api';            const client = new PocketBase(getPocketBaseUrl());
return import.meta.env.VITE_POCKETBASE_URL || '/api';            set(client);
return import.meta.env.VITE_POCKETBASE_URL || '/api';            return client;
return import.meta.env.VITE_POCKETBASE_URL || '/api';        },
return import.meta.env.VITE_POCKETBASE_URL || '/api';        getAuthStore: () => {
return import.meta.env.VITE_POCKETBASE_URL || '/api';            const client = get(pbStore);
return import.meta.env.VITE_POCKETBASE_URL || '/api';            return client ? client.authStore : null;
return import.meta.env.VITE_POCKETBASE_URL || '/api';        }
return import.meta.env.VITE_POCKETBASE_URL || '/api';    };
return import.meta.env.VITE_POCKETBASE_URL || '/api';};
return import.meta.env.VITE_POCKETBASE_URL || '/api';
return import.meta.env.VITE_POCKETBASE_URL || '/api';export const pbStore = createPocketBaseStore();
return import.meta.env.VITE_POCKETBASE_URL || '/api';
return import.meta.env.VITE_POCKETBASE_URL || '/api';// Initialize the client immediately
return import.meta.env.VITE_POCKETBASE_URL || '/api';pbStore.init();