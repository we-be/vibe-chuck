<script>
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    import { Shell } from 'lucide-svelte';
    import { events, fetchEvents } from '$lib/stores/events';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import Post from '$lib/Post.svelte';
    import FullScreenPost from '$lib/FullScreenPost.svelte';
    
    export let data;
    const { topPosts } = data;
    
    let animatingEvents = [];
    let showPosts = false;
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
    
    let fullScreenPost = null;
    
    function openFullScreen(event) {
        fullScreenPost = event.detail.post;
    }
    
    function closeFullScreen() {
        fullScreenPost = null;
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
        
        // Show posts after events have appeared
        setTimeout(() => {
            showPosts = true;
        }, $events.length * 300 + 500);
    });
</script>

<div class="flex flex-col items-center justify-center min-h-screen py-16 space-y-10">
    <h2 class="flex flex-col sm:flex-row items-center justify-center text-center space-y-4 sm:space-y-0 sm:space-x-4 text-5xl sm:text-6xl md:text-8xl uppercase mb-8">
        <Shell class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
        <span class="bg-clip-text text-transparent bg-gradient-to-br variant-gradient-tertiary-primary font-bold">
            VIBE CHUCK
        </span>
    </h2>
    
    <div class="flex flex-col items-center mt-4 space-y-10 w-full">
        <!-- Event cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 w-full max-w-4xl">
            {#each animatingEvents as event, i (event.id)}
                <button
                    class="card p-4 bg-gradient-to-br variant-gradient-secondary-primary text-white text-md sm:text-lg md:text-xl font-semibold
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
                    <div class="text-xs sm:text-sm mt-2 opacity-90 flex flex-wrap items-center">
                        <span class="badge variant-soft-primary text-xs mr-2 mb-1">Starts</span>
                        {formatDate(event.start)}
                    </div>
                </button>
            {/each}
        </div>
        
        <!-- Top posts section -->
        {#if showPosts && topPosts.length > 0}
            <div in:fade={{ duration: 800 }} class="mt-12 w-full max-w-5xl px-4">
                <h3 class="text-xl sm:text-2xl font-bold text-center mb-6 pb-2 border-b-2 border-primary-500 inline-block mx-auto">Top Posts</h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {#each topPosts as post, i}
                        <div in:fly={{
                            y: 50,
                            delay: i * 150,
                            duration: 600,
                            easing: elasticOut
                        }}>
                            <div class="relative">
                                <Post
                                    {post}
                                    canEdit={false}
                                    on:openFullScreen={openFullScreen}
                                    on:postDeleted={() => {
                                        // Refresh the page when a post is deleted
                                        window.location.reload();
                                    }}
                                />
                                <div class="absolute top-3 right-3 z-20">
                                    <span class="badge variant-filled-secondary">{post.eventDisplayName}</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

{#if fullScreenPost}
    <FullScreenPost 
        post={fullScreenPost} 
        canEdit={false}
        on:close={closeFullScreen} 
    />
{/if}
