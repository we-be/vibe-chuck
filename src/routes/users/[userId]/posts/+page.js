import { pbStore } from '$lib/pocketbase';

export const load = async ({ params, url }) => {
    console.log('Load function called with params:', params);
    const pb = await pbStore.init();
    const userId = params.userId

    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');

    const { items: records, totalItems } = await pb.collection('posts').getList(page, perPage, {
        // filter: `user = "${userId}"`
    });

    // Map over records to construct image URLs and include user information
    const posts = records.map((record) => {
        const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
        return {
            id: record.id,
            title: record.title,
            imgs,
            rank: record.rank,
            event: record.event,
            description: record.description,
            votes: record.votes
        };
    });

    return {
        posts,
        pagination: {
          page,
          perPage,
          totalItems,
          totalPages: Math.ceil(totalItems / perPage)
        },
        error: null,
    }
};