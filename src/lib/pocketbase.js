import PocketBase from 'pocketbase';
import { writable, get } from 'svelte/store';

// Get the PocketBase URL from environment variables or use a default
const getPocketBaseUrl = () => {
    const envUrl = import.meta.env.VITE_POCKETBASE_URL;
    if (envUrl) {
        // If it's an absolute URL, use it (strip any trailing slash)
        if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
            return envUrl.replace(/\/+$/, '');
        }
        // If it's a relative proxy path (e.g. '/api'), let SDK prefix '/api', so base is empty
        return '';
    }
    // Default fallback to root; SDK will add '/api' prefix
    return '';
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