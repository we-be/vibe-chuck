<script>
    import { onMount } from 'svelte';
    import { pbStore } from './pocketbase';
    import { goto } from '$app/navigation';

    export let requireAuth = false;

    onMount(() => {
        const pb = pbStore.init();
        const authStore = pb.authStore;

        if (requireAuth && !authStore.isValid) {
            goto('/login');
        }
    });
</script>

<slot></slot>