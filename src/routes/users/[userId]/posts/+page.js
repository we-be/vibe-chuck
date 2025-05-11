import { pbStore } from '$lib/pocketbase';

export const load = async ({ params, url }) => {
    console.log('Load function called with params:', params);
    const pb = await pbStore.init();
    const userId = params.userId;
    let canEdit = false;
    let posts = [];
    let totalItems = 0;
    let page = 1;
    let perPage = 10;

    try {
        // Check if user is authenticated
        if (pb.authStore.isValid) {
            canEdit = userId === pb.authStore.model.id;
        } else {
            console.log('User is not authenticated');
        }

        page = parseInt(url.searchParams.get('page') || '1');
        perPage = parseInt(url.searchParams.get('perPage') || '15');

        // Fetch posts
        const { items: records, totalItems: total } = await pb.collection('posts').getList(page, perPage, {
            filter: `op = "${userId}"`,
            expand: 'op',
            // sort: '-created'
        });

        totalItems = total;

        // Map over records to construct image URLs and include user information
        posts = records.map((record) => {
            const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
            return {
                id: record.id,
                title: record.title,
                imgs,
                rank: record.rank,
                event: record.event,
                description: record.description,
                votes: record.votes,
                // use the 'op' field (original poster ID) for routing edits
                op: record.op,
                opName: record.expand?.op?.name || record.expand?.op?.username || 'Unknown User'
            };
        });

        console.log(`Successfully fetched ${posts.length} posts`);

    } catch (error) {
        console.error('Error in load function:', error);
        return {
            posts: [],
            pagination: {
                page: 1,
                perPage: 10,
                totalItems: 0,
                totalPages: 0
            },
            error: 'Failed to fetch posts: ' + error.message,
            canEdit: false
        };
    }

    return {
        posts,
        pagination: {
            page,
            perPage,
            totalItems,
            totalPages: Math.ceil(totalItems / perPage)
        },
        error: null,
        canEdit
    };
};