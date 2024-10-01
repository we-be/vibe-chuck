<script lang="ts">
	import { onMount } from 'svelte';

	// Define a type for the records you are fetching
	type EventRecord = {
		id: string;
		name: string;
		description: string;
		created: string; // You can adjust this based on your data structure
	};

	let records: EventRecord[] = [];
	let error: string | null = null;

	// Fetch data from the 'events' collection in PocketBase
	onMount(async () => {
		try {
			const response = await fetch('https://pb.we-be.xyz/api/collections/events/records');
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			const data = await response.json();
			records = data.items as EventRecord[]; // Ensure it conforms to the EventRecord type
		} catch (err) {
			error = (err as Error).message;
		}
	});
</script>

<!-- Page Content -->
<section class="container mx-auto p-8">
	<h1 class="text-4xl font-bold text-center mb-6">Welcome to Our Awesome App!</h1>

	{#if error}
		<p class="text-red-600 text-center">Error: {error}</p>
	{:else if records.length === 0}
		<p class="text-center">Loading data...</p>
	{:else}
		<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each records as record}
				<li class="p-4 bg-white shadow rounded-lg">
					<h2 class="text-2xl font-bold mb-2">{record.name}</h2>
					<p>{record.description}</p>
					<small class="text-gray-500">Created on: {new Date(record.created).toLocaleDateString()}</small>
				</li>
			{/each}
		</ul>
	{/if}
</section>