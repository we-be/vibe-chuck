<script>
  import { onMount } from "svelte";
  import "../app.postcss";
  import { AppShell, AppBar } from "@skeletonlabs/skeleton";
  import { writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { pbStore } from "$lib/pocketbase";
  import AuthWrapper from "$lib/AuthWrapper.svelte";
  import { page } from "$app/stores";
  import { events, fetchEvents } from "$lib/stores/events";
  import { Shell, CirclePlus } from "lucide-svelte";

  let isLoggedIn = writable(false);

  async function checkAuthStatus() {
    const pb = await pbStore.init();
    isLoggedIn.set(pb.authStore.isValid);
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
    goto("/login");
  }

  function loginSignup() {
    goto("/login");
  }

  function navigateToNewPost() {
    goto("/new-post");
  }

  function isEventInFuture(eventStartDate) {
    const currentDate = new Date();
    const startDate = new Date(eventStartDate);
    return startDate > currentDate;
  }

  // Subscribe to page changes
  $: {
    if ($page.url.pathname === "/") {
      checkAuthStatus();
      fetchEvents();
    }
  }

  $: isLoginPage = $page.url.pathname === "/login";
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <Shell class="mr-2" />
        <strong class="text-xl uppercase">Vibe Chuck</strong>
        <button
          type="button"
          class="btn-icon btn-icon-sm bg-gradient-to-br variant-gradient-tertiary-primary ml-6"
          on:click={navigateToNewPost}
          disabled={!$isLoggedIn}
        >
          <CirclePlus />
        </button>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#each $events as event}
          <button
            class="btn btn-sm variant-ghost-surface"
            on:click={() => navigateToEvent(event.id)}
            disabled={isEventInFuture(event.start)}
          >
            {event.displayName}
          </button>
        {/each}
        {#if $isLoggedIn}
          <button class="btn btn-sm variant-ghost-surface" on:click={logout}
            >Logout</button
          >
        {:else}
          <button
            class="btn btn-sm variant-ghost-surface"
            on:click={loginSignup}>Login/Sign-Up</button
          >
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

<style>
  :global(.btn:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
