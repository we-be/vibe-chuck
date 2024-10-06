import { writable } from 'svelte/store';
import { pbStore } from '$lib/pocketbase';

export const events = writable([]);

export async function fetchEvents() {
    try {
        const pb = await pbStore.init();
        const records = await pb.collection('events').getFullList({
            sort: '-start',
        });
        events.set(records);
    } catch (error) {
        console.error('Failed to fetch events', error);
    }
}