import PocketBase from 'pocketbase';
import { writable, get } from 'svelte/store';

// Get the PocketBase URL from environment variables or use a default
const getPocketBaseUrl = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
    }
    return 'http://localhost:8090'; // Default fallback
};

// Create a writable store for the PocketBase client
const createPocketBaseStore = () => {
    const { subscribe, set } = writable(null);

    return {
        subscribe,
        init: () => {
            const client = new PocketBase(getPocketBaseUrl());
            set(client);
            return client;
        },
        getAuthStore: () => {
            const client = get(pbStore);
            return client ? client.authStore : null;
        }
    };
};

export const pbStore = createPocketBaseStore();

// Initialize the client immediately
pbStore.init();