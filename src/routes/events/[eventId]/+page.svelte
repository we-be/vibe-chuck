<script lang="ts">
	import { page } from '$app/stores';
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';

	// Initialize PocketBase client
	const pb = new PocketBase('https://pb.we-be.xyz');

	// Post type
	type Post = {
		id: string;
		title: string;
		image: string;
		rank: number;
		event: string;
	};

	let posts: Post[] = [];
	let error: string | null = null;
	let eventId: string | undefined = undefined;

	// Subscribe to the page store to get the dynamic eventId
	$: eventId = $page.params.eventId;

	// Reactive fetch that triggers when eventId changes
	$: if (eventId) {
		fetchPosts();
	}

	// Function to fetch posts for the selected event
	async function fetchPosts() {
		try {
			const records = await pb.collection('posts').getFullList<Post>({
				filter: `event = "${eventId}"`,
				sort: 'rank',
			});
			posts = records;
			error = null; // Clear any previous errors
		} catch (err) {
			error = (err as Error).message;
			posts = []; // Clear posts if there's an error
		}
	}
</script>

<!-- Page Content -->
<section class="container mx-auto p-8">
	{#if error}
		<p class="text-red-600 text-center">Error: {error}</p>
	{:else if posts.length === 0}
		<p class="text-center">No posts yet for this event.</p>
	{:else}
		<h1 class="text-4xl font-bold text-center mb-6">Posts for Event</h1>
		<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each posts as post}
				<li class="p-4 bg-white shadow rounded-lg">
					<h2 class="text-2xl font-bold mb-2">{post.title}</h2>
					<img src={post.image} alt={post.title} class="w-full h-48 object-cover mb-4"/>
					<p class="text-gray-500">Rank: {post.rank}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>