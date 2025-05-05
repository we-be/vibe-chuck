import PocketBase from 'pocketbase';
import { writable, get } from 'svelte/store';

// Get the PocketBase URL from environment variables or use a default
const getPocketBaseUrl = () => {
    if (import.meta?.env) {
        return import.meta.env.VITE_POCKETBASE_URL || '/api';
    }
    return '/api';
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
            return client?.authStore || null;
        }
    };
};

// Export the PocketBase store and initialize it immediately
export const pbStore = createPocketBaseStore();
pbStore.init();