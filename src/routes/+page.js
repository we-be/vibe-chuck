import { pbStore } from '$lib/pocketbase';

export const load = async () => {
  try {
    const pb = await pbStore.init(); // Ensure the client is initialized
    
    // Check if user is authenticated
    let canEdit = false;
    let currentUserId = null;
    
    if (pb.authStore.isValid) {
      canEdit = true;
      currentUserId = pb.authStore.model.id;
    }
    
    // Fetch all events
    const events = await pb.collection('events').getFullList({
      sort: '-start',
    });
    
    // Only get posts from events that have already started
    const currentDate = new Date();
    const activeEvents = events.filter(event => new Date(event.start) <= currentDate);
    
    // Prepare posts data structure
    let topPosts = [];
    
    // Fetch top 2 posts for each active event
    for (const event of activeEvents) {
      const { items } = await pb.collection('posts').getList(1, 2, {
        filter: `event = "${event.id}" && rank > 0`,
        sort: 'rank',
      });
      
      if (items.length > 0) {
        // Map over records to construct image URLs and include user information
        const posts = items.map((record) => {
          const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
          return {
            id: record.id,
            title: record.title,
            imgs,
            rank: record.rank,
            event: record.event,
            description: record.description,
            op: record.op, // Keep the original poster ID for authorization checks
            votes: record.votes,
            eventDisplayName: event.displayName
          };
        });
        
        topPosts = [...topPosts, ...posts];
      }
    }
    
    // Sort by rank and limit to top 6 posts
    topPosts.sort((a, b) => a.rank - b.rank);
    topPosts = topPosts.slice(0, 6);
    
    return {
      topPosts,
      canEdit,
      currentUserId
    };
  } catch (err) {
    console.error('Error fetching data for landing page:', err);
    return {
      topPosts: [],
      canEdit: false,
      currentUserId: null
    };
  }
};

export const ssr = false;