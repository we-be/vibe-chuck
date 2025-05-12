<script>
    import { onMount } from "svelte";
    import "../app.postcss";
    import {
        AppShell,
        AppBar,
        Toast,
        getToastStore,
        initializeStores,
    } from "@skeletonlabs/skeleton";
    import { writable } from "svelte/store";
    import { goto } from "$app/navigation";
    import { pbStore } from "$lib/pocketbase";
    import AuthWrapper from "$lib/AuthWrapper.svelte";
    import { page } from "$app/stores";
    import { events, fetchEvents } from "$lib/stores/events";
    import {
        Shell,
        CirclePlus,
        Menu,
        GalleryVerticalEnd,
        User,
    } from "lucide-svelte";

    initializeStores();
    const toastStore = getToastStore();
    let isLoggedIn = writable(false);
    let isMobileMenuOpen = false;
    // current user model from PocketBase (authStore.model)
    let user = null;

    async function checkAuthStatus() {
        const pb = await pbStore.init();
        isLoggedIn.set(pb.authStore.isValid);
        // update local user when logged in
        if (pb.authStore.isValid) {
            user = pb.authStore.model;
        } else {
            user = null;
        }
    }

    onMount(() => {
        fetchEvents();
        checkAuthStatus();
    });

    function navigateToEvent(eventId) {
        goto(`/events/${eventId}`);
    }

    async function logout() {
        const pb = await pbStore.init();
        pb.authStore.clear();
        isLoggedIn.set(false);
        user = null;
        goto("/login");
    }

    function loginSignup() {
        goto("/login");
    }

    function navigateToNewPost() {
        const pb = pbStore.init();
        if (!pb.authStore.isValid) {
            toastStore.trigger({
                message: 'Please login to create a new post',
                background: 'variant-filled-warning'
            });
            goto("/login");
            return;
        }
        goto("/new-post");
    }

    async function navigateToUserPosts() {
        const pb = await pbStore.init();
        if (!pb.authStore.isValid) {
            toastStore.trigger({
                message: 'Please login to view your posts',
                background: 'variant-filled-warning'
            });
            goto("/login");
            return;
        }
        let userId = pb.authStore.model.id;
        goto(`/users/${userId}/posts?page=1&perPage=10`);
    }

    function isEventInFuture(eventStartDate) {
        const currentDate = new Date();
        const startDate = new Date(eventStartDate);
        return startDate > currentDate;
    }

    function formatDate(date) {
        return new Date(date).toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function handleEventClick(event) {
        if (isEventInFuture(event.start)) {
            toastStore.trigger({
                message: `Event "${event.displayName}" starts on ${formatDate(event.start)}`,
                background: "variant-filled-primary",
            });
        } else {
            navigateToEvent(event.id);
        }
    }

    // Subscribe to page changes
    $: {
        if ($page.url.pathname === "/") {
            checkAuthStatus();
            fetchEvents();
        }
    }

    $: isLoginPage = $page.url.pathname === "/login";

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }
</script>

<Toast />

<AppShell>
    <svelte:fragment slot="header">
        <AppBar>
            <svelte:fragment slot="lead">
                <div 
                    class="flex items-center cursor-pointer" 
                    on:click={() => goto('/')}
                    on:keydown={(e) => e.key === 'Enter' && goto('/')}
                    tabindex="0"
                    role="link"
                    aria-label="Go to home page"
                >
                    <Shell class="mr-2" />
                    <strong class="text-xl uppercase"
                        ><span class="gradient-heading">Vibe Chuck</span></strong
                    >
                </div>
                <button
                    type="button"
                    class="btn btn-sm variant-filled-primary ml-6 flex items-center"
                    on:click={navigateToNewPost}
                    disabled={!$isLoggedIn}
                    title={$isLoggedIn ? "Create a new post" : "Login to create a post"}
                    aria-label="Create a new post"
                >
                    <CirclePlus class="mr-1" /> <span class="hidden sm:inline">New Post</span>
                </button>
                <button
                    type="button"
                    class="btn btn-sm variant-filled-secondary ml-3 flex items-center"
                    on:click={navigateToUserPosts}
                    disabled={!$isLoggedIn}
                    title={$isLoggedIn ? "View your posts" : "Login to view your posts"}
                    aria-label="View your posts"
                >
                    <GalleryVerticalEnd class="mr-1" /> <span class="hidden sm:inline">My Posts</span>
                </button>
            </svelte:fragment>
            <svelte:fragment slot="default">
                <div
                    class="hidden md:flex justify-center items-center space-x-2 w-full"
                >
                    {#each $events as event}
                        <button
                            class="btn btn-sm variant-ghost-surface {isEventInFuture(
                                event.start,
                            )
                                ? 'future-event'
                                : ''}"
                            on:click={() => handleEventClick(event)}
                            title={isEventInFuture(event.start)
                                ? `Starts ${formatDate(event.start)}`
                                : ""}
                        >
                            {event.displayName}
                        </button>
                    {/each}
                </div>
            </svelte:fragment>
            <svelte:fragment slot="trail">
                <!-- Desktop menu -->
                <div class="hidden md:flex items-center space-x-2">
                    {#if $isLoggedIn}
                        <button
                            class="btn btn-sm variant-ghost-surface flex items-center"
                            on:click={() => goto("/account")}
                        >
                            <User class="mr-2" />{user.username}
                        </button>
                    {:else}
                        <button
                            class="btn btn-sm variant-ghost-surface"
                            on:click={loginSignup}>Login/Sign-Up</button
                        >
                    {/if}
                </div>
                <!-- Mobile menu button -->
                <button
                    class="md:hidden btn btn-sm variant-ghost-surface"
                    on:click={toggleMobileMenu}
                >
                    <Menu />
                </button>
            </svelte:fragment>
        </AppBar>
        <!-- Mobile menu -->
        {#if isMobileMenuOpen}
            <div class="md:hidden bg-surface-100-800-token p-4">
                {#each $events as event}
                    <button
                        class="btn btn-sm variant-ghost-surface w-full mb-2 {isEventInFuture(
                            event.start,
                        )
                            ? 'future-event'
                            : ''}"
                        on:click={() => handleEventClick(event)}
                        title={isEventInFuture(event.start)
                            ? `Starts ${formatDate(event.start)}`
                            : ""}
                    >
                        {event.displayName}
                    </button>
                {/each}
                {#if $isLoggedIn}
                    <button
                        class="btn btn-sm variant-ghost-surface w-full mb-2 flex items-center"
                        on:click={() => goto("/account")}
                    >
                        <User class="mr-2" />
                        Account
                    </button>
                {:else}
                    <button
                        class="btn btn-sm variant-ghost-surface w-full mb-2"
                        on:click={loginSignup}>Login/Sign-Up</button
                    >
                {/if}
            </div>
        {/if}
    </svelte:fragment>
    {#if isLoginPage}
        <slot />
    {:else}
        <AuthWrapper>
            <slot />
        </AuthWrapper>
    {/if}
</AppShell>

<style>
    :global(.future-event) {
        opacity: 0.5;
        cursor: help;
    }
</style>
