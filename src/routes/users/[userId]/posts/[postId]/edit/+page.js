import { pbStore } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const { userId, postId } = params;
    const pb = await pbStore.init();
    // Ensure user is authenticated
    if (!pb.authStore.isValid) {
        throw error(401, 'Not authenticated');
    }
    // Only allow post owner to edit
    if (pb.authStore.model.id !== userId) {
        throw error(403, 'Unauthorized');
    }
    let record;
    try {
        record = await pb.collection('posts').getOne(postId);
    } catch (e) {
        throw error(404, 'Post not found');
    }
    const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
    return {
        post: {
            id: record.id,
            title: record.title,
            description: record.description,
            event: record.event,
            imgs
        },
        userId
    };
}