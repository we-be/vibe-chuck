import { pbStore } from '$lib/pocketbase';

export const load = async ({ params, url }) => {
  console.log('Load function called with params:', params);
  const pb = await pbStore.init(); // Ensure the client is initialized
  const eventId = params.eventId;
  try {
    // Fetch posts for the selected event
    const records = await pb.collection('posts').getFullList({
      filter: `event = "${eventId}"`,
      sort: 'rank',
      expand: 'imgs',
    });
    // Map over records to construct image URLs
    const posts = records.map((record) => {
      // Ensure 'imgs' is an array of file names
      const imgs = record.imgs?.map(img => pb.getFileUrl(record, img)) || [];
      return {
        id: record.id,
        title: record.title,
        imgs,
        rank: record.rank,
        event: record.event,
      };
    });
    return {
      posts,
      error: null,
    };
  } catch (err) {
    console.error('Error fetching posts:', err);
    return {
      posts: [],
      error: err.message,
    };
  }
};

export const ssr = false;