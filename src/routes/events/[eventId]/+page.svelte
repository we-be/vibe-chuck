<script>
    import Post from '$lib/Post.svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    // Access the posts and pagination data from the page store
    $: ({ posts, pagination } = $page.data);

    // Function to handle page changes
    function changePage(newPage) {
        goto(`?page=${newPage}&perPage=${pagination.perPage}`);
    }
</script>

<div class="posts-container">
    {#each posts as post (post.id)}
        <Post {post} />
    {/each}
</div>

<!-- Pagination controls -->
<div class="pagination">
    <button on:click={() => changePage(pagination.page - 1)} disabled={pagination.page === 1}>
        Previous
    </button>
    <span>Page {pagination.page} of {pagination.totalPages}</span>
    <button on:click={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
        Next
    </button>
</div>

<style>
    .posts-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
    }

    .pagination button {
        margin: 0 10px;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>