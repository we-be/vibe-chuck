<script>
    import { onMount } from 'svelte';
    import '../app.postcss';
    import { AppShell, AppBar } from '@skeletonlabs/skeleton';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { pbStore } from '$lib/pocketbase';
    import AuthWrapper from '$lib/AuthWrapper.svelte';
    import { page } from '$app/stores';

    // Store for events
    export let events = writable([]);

    // Store for auth status
    let isLoggedIn = writable(false);

    // Fetch events on mount and check auth status
    onMount(async () => {
        try {
            const pb = await pbStore.init(); // Ensure the client is initialized
            const records = await pb.collection('events').getFullList({
                sort: '-start',
            });
            events.set(records);
            
            // Check auth status
            isLoggedIn.set(pb.authStore.isValid);
        } catch (error) {
            console.error('Failed to fetch events', error);
        }
    });

    // Function to navigate to the selected event
    function navigateToEvent(eventId) {
        goto(`/events/${eventId}`);
    }

    // Function to handle logout
    async function logout() {
        const pb = await pbStore.init();
        pb.authStore.clear();
        isLoggedIn.set(false);
        goto('/login');
    }

    // Function to handle login/signup
    function loginSignup() {
        goto('/login');
    }

    $: isLoginPage = $page.url.pathname === '/login';
</script>

{#if isLoginPage}
    <slot />
{:else}
    <AuthWrapper>
        <AppShell>
            <svelte:fragment slot="header">
                <AppBar>
                    <svelte:fragment slot="lead">
                        <strong class="text-xl uppercase">Skeleton</strong>
                    </svelte:fragment>
                    <svelte:fragment slot="trail">
                        {#if $isLoggedIn}
                            {#each $events as event}
                                <button class="btn btn-sm variant-ghost-surface" on:click={() => navigateToEvent(event.id)}>
                                    {event.name}
                                </button>
                            {/each}
                            <button class="btn btn-sm variant-ghost-surface" on:click={logout}>Logout</button>
                        {:else}
                            <button class="btn btn-sm variant-ghost-surface" on:click={loginSignup}>Login/Sign-Up</button>
                        {/if}
                    </svelte:fragment>
                </AppBar>
            </svelte:fragment>
            <slot />
        </AppShell>
    </AuthWrapper>
{/if}