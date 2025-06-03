import PocketBase from 'pocketbase';
import { writable, get } from 'svelte/store';

// Base URL for the PocketBase backend, must be set in .env (e.g. VITE_POCKETBASE_URL=/api)
const BASE_URL = import.meta.env.VITE_POCKETBASE_URL || '/api';

// Create a writable store for the PocketBase client
const createPocketBaseStore = () => {
    const { subscribe, set } = writable(null);

    return {
        subscribe,
        init: () => {
            const client = new PocketBase(BASE_URL);
            set(client);
            return client;
        }
    };
};

// Export the PocketBase store and initialize it immediately
export const pbStore = createPocketBaseStore();
pbStore.init();