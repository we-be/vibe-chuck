<script>
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
  
    export let data;
    
    $: ({ posts = [], error } = data);
  
    $: console.log('Posts:', posts);
  
    onMount(() => {
      return page.subscribe(() => {
        invalidate('data:posts');
      });
    });
  </script>
  
  <!-- Page Content -->
  <section class="container mx-auto p-8">
    {#if error}
      <p class="text-red-600 text-center">Error: {error}</p>
    {:else if !Array.isArray(posts) || posts.length === 0}
      <p class="text-center">No posts available for this event.</p>
    {:else}
      <h1 class="text-4xl font-bold text-center mb-6">Posts for Event</h1>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each posts as post}
          <li class="p-4 bg-white shadow rounded-lg">
            <h2 class="text-2xl font-bold mb-2">{post.title}</h2>
            <!-- Image Scroll Container -->
            <div class="flex overflow-x-auto space-x-4 mb-4">
              {#each post.imgs || [] as img}
                <img src={img} alt={post.title} class="w-64 h-48 object-cover flex-shrink-0"/>
              {/each}
            </div>
            <p class="text-gray-500">Rank: {post.rank}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
  
  <style>
    /* Optional: Customize the scrollbar for better UX */
    .flex::-webkit-scrollbar {
      height: 8px;
    }
    .flex::-webkit-scrollbar-thumb {
      background-color: #a0aec0;
      border-radius: 4px;
    }
  </style>