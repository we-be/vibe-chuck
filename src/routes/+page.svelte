<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    import { Shell } from 'lucide-svelte';
    import { events, fetchEvents } from '$lib/stores/events';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    
    let animatingEvents = [];
    const toastStore = getToastStore();
    
    function formatDate(date) {
        return new Date(date).toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
    
    function isEventInFuture(eventStartDate) {
        const currentDate = new Date();
        const startDate = new Date(eventStartDate);
        return startDate > currentDate;
    }
    
    function handleEventClick(event) {
        if (isEventInFuture(event.start)) {
            toastStore.trigger({
                message: `Event "${event.displayName}" starts on ${formatDate(event.start)}`,
                background: "variant-filled-primary",
            });
        } else {
            goto(`/events/${event.id}`);
        }
    }
    
    onMount(async () => {
        // Fetch events if needed
        if ($events.length === 0) {
            await fetchEvents();
        }
        
        // Animate events appearing one by one
        $events.forEach((event, index) => {
            setTimeout(() => {
                animatingEvents = [...animatingEvents, event];
            }, index * 300); // Stagger the animations
        });
    });
</script>

<div class="flex flex-col items-center justify-center min-h-screen py-16 space-y-10">
    <h2 class="flex items-center space-x-4 text-8xl uppercase mb-8">
        <Shell class="w-16 h-16" />
        <span class="bg-clip-text text-transparent bg-gradient-to-br variant-gradient-tertiary-primary">
            VIBE CHUCK
        </span>
    </h2>
    
    <div class="flex flex-col items-center mt-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {#each animatingEvents as event, i (event.id)}
                <button 
                    class="card p-4 bg-gradient-to-br variant-gradient-secondary-primary text-white text-xl font-semibold
                           transition-transform hover:scale-105 hover:shadow-lg hover:z-10 {isEventInFuture(event.start) ? 'opacity-75' : ''}"
                    in:fly={{ 
                        y: 50, 
                        x: Math.sin(i) * 20, 
                        duration: 600,
                        delay: i * 100,
                        easing: elasticOut
                    }}
                    on:click={() => handleEventClick(event)}
                >
                    <div class="flex items-center justify-between">
                        <span>{event.displayName}</span>
                        {#if isEventInFuture(event.start)}
                            <span class="badge variant-filled-warning text-xs">Upcoming</span>
                        {/if}
                    </div>
                    <div class="text-sm mt-2 opacity-90 flex items-center">
                        <span class="badge variant-soft-primary text-xs mr-2">Starts</span>
                        {formatDate(event.start)}
                    </div>
                </button>
            {/each}
        </div>
    </div>
</div>
