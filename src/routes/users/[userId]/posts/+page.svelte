<script>
    import { page } from "$app/stores";
    import Post from "$lib/Post.svelte"

    // Access the posts and pagination data from the page store
    $: ({ posts, pagination } = $page.data);

    // Function to handle page changes
    function changePage(newPage) {
        goto(`?page=${newPage}&perPage=${pagination.perPage}`);
    }
</script>

<div class="posts-container">
    {#each posts as post (post.id)}
        <Post {post} canEdit=true />
    {/each}
</div>

<style>
    .posts-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }
</style>
