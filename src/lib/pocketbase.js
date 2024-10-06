import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// Create a writable store for the PocketBase client
const createPocketBaseStore = () => {
    const { subscribe, set } = writable(null);

    return {
        subscribe,
        init: () => {
            const client = new PocketBase('https://pb.we-be.xyz');
            set(client);
            return client;
        }
    };
};

export const pbStore = createPocketBaseStore();

// Initialize the client immediately
pbStore.init();