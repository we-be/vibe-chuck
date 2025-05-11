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
    // Fetch all posts for the selected event without server-side sorting
    const { items: records, totalItems } = await pb.collection('posts').getList(1, 100, {
      filter: `event = "${eventId}"`,  // include all posts, even those with no rank
      expand: 'op',
    });

    // Map over records to construct image URLs and include user information
    let posts = records.map((record) => {
      const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
      return {
        id: record.id,
        title: record.title,
        imgs,
        rank: record.rank || 999999, // Use high number for unranked posts for sorting
        event: record.event,
        description: record.description,
        op: record.op, // use the original poster ID for checking ownership
        opName: record.expand?.op?.name || record.expand?.op?.username || 'Unknown User',
        votes: record.votes,
        hasRank: record.rank ? true : false // Flag to identify if it has a real rank
      };
    });

    // Sort with ranked posts first, then unranked posts by creation date
    posts.sort((a, b) => {
      // If one has rank and the other doesn't, prioritize the ranked one
      if (a.hasRank && !b.hasRank) return -1;
      if (!a.hasRank && b.hasRank) return 1;

      // If both have ranks or both don't, sort by rank
      return a.rank - b.rank;
    });

    // Apply pagination
    const startIndex = (page - 1) * perPage;
    posts = posts.slice(startIndex, startIndex + perPage);

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