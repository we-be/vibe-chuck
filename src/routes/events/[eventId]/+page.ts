import PocketBase from 'pocketbase';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const pb = new PocketBase('https://pb.we-be.xyz');
  const eventId = params.eventId;

  try {
    // Fetch posts for the selected event
    const records = await pb.collection('posts').getFullList({
      filter: `event = "${eventId}"`,
      sort: 'rank',
      expand: 'imgs', // If imgs is a relation or need to be expanded
    });

    // Map over records to construct image URLs
    const posts = records.map((record) => {
      // Ensure 'imgs' is an array of file names
      const imgs = record.imgs?.map((img: string) => pb.getFileUrl(record, img)) || [];

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
      error: (err as Error).message,
    };
  }
};
