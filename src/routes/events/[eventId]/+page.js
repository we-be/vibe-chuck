import { pbStore } from '$lib/pocketbase';

export const load = async ({ params, url }) => {
  console.log('Load function called with params:', params);
  const pb = await pbStore.init(); // Ensure the client is initialized
  const eventId = params.eventId;
  
  // Check if user is authenticated
  let canEdit = false;
  let currentUserId = null;
  
  if (pb.authStore.isValid) {
    canEdit = true;
    currentUserId = pb.authStore.model.id;
  }

  // Get pagination parameters from the URL
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '5');

  try {
    // Fetch paginated posts for the selected event
    const { items: records, totalItems } = await pb.collection('posts').getList(page, perPage, {
      filter: `event = "${eventId}" && rank > 0`,  // rank of zero means its brand new
      sort: 'rank',
      expand: 'op',
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
        op: record.op, // use the original poster ID for checking ownership
        opName: record.expand?.op?.name || record.expand?.op?.username || 'Unknown User',
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
      canEdit,
      currentUserId,
      error: null,
    };
  } catch (err) {
    console.error('Error fetching posts:', err);
    return {
      posts: [],
      pagination: {
        page: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0
      },
      canEdit: false,
      currentUserId: null,
      error: err.message,
    };
  }
};

export const ssr = false;