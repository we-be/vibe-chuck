<script>
    import { onMount } from 'svelte';
    import '../app.postcss';
    import { AppShell, AppBar } from '@skeletonlabs/skeleton';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { pbStore } from '$lib/pocketbase';
    import AuthWrapper from '$lib/AuthWrapper.svelte';
    import { page } from '$app/stores';
    import { events, fetchEvents } from '$lib/stores/events';

    // Store for auth status
    let isLoggedIn = writable(false);

    // Function to check auth status
    async function checkAuthStatus() {
        const pb = await pbStore.init();
        isLoggedIn.set(pb.authStore.isValid);
    }

    // Fetch events and check auth status on mount
    onMount(() => {
        fetchEvents();
        checkAuthStatus();
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

    // Subscribe to page changes
    $: {
        if ($page.url.pathname === '/') {
            checkAuthStatus();
            fetchEvents();
        }
    }

    $: isLoginPage = $page.url.pathname === '/login';
</script>

<AppShell>
    <svelte:fragment slot="header">
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
                {#if $isLoggedIn}
                    <button class="btn btn-sm variant-ghost-surface" on:click={logout}>Logout</button>
                {:else}
                    <button class="btn btn-sm variant-ghost-surface" on:click={loginSignup}>Login/Sign-Up</button>
                {/if}
            </svelte:fragment>
        </AppBar>
    </svelte:fragment>
    {#if isLoginPage}
        <slot />
    {:else}
        <AuthWrapper>
            <slot />
        </AuthWrapper>
    {/if}
</AppShell>