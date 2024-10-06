<script>
    import { onMount } from 'svelte';
    import '../app.postcss';
    import { AppShell, AppBar } from '@skeletonlabs/skeleton';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import PocketBase from 'pocketbase';

    // Initialize PocketBase client
    const pb = new PocketBase('https://pb.we-be.xyz');

    // Store for events
    export let events = writable([]);

    // Fetch events on mount
    onMount(async () => {
        try {
            const records = await pb.collection('events').getFullList({
                sort: '-start', // You can sort the events by start date
            });
            events.set(records);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    });

    // Function to navigate to the selected event
    function navigateToEvent(eventId) {
        goto(`/events/${eventId}`);
    }
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Skeleton</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#each $events as event}
					<button class="btn btn-sm variant-ghost-surface" on:click={() => navigateToEvent(event.id)}>
						{event.name}
					</button>
				{/each}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>