<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { Shell } from 'lucide-svelte';
    let showFirst = false;
    let showSecond = false;
    onMount(() => {
        // fade in the first line immediately
        showFirst = true;
        // fade in the second line after a brief delay
        setTimeout(() => showSecond = true, 1000);
    });
</script>

<div class="flex flex-col items-center justify-center h-screen space-y-6">
    {#if showFirst}
        <h1 in:fade={{ duration: 800 }} class="text-6xl font-extrabold">
            Will you pass...
        </h1>
    {/if}
    {#if showSecond}
        <h2 in:fade={{ duration: 800 }} class="flex items-center space-x-4 text-8xl uppercase">
            <Shell class="w-16 h-16" />
            <span class="bg-clip-text text-transparent bg-gradient-to-br variant-gradient-tertiary-primary">
                the VIBE CHUCK?
            </span>
        </h2>
    {/if}
</div>
