<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import Post from "$lib/Post.svelte";
    import FullScreenPost from "$lib/FullScreenPost.svelte";

    $: ({ posts, pagination, canEdit } = $page.data);

    let fullScreenPost = null;

    function changePage(newPage) {
        goto(`?page=${newPage}&perPage=${pagination.perPage}`);
    }

    function openFullScreen(event) {
        fullScreenPost = event.detail.post;
    }

    function closeFullScreen() {
        fullScreenPost = null;
    }
</script>

<div class="posts-container">
    {#each posts as post (post.id)}
        <Post {post} {canEdit} on:openFullScreen={openFullScreen} on:postDeleted={() => {
            // Refresh the page when a post is deleted
            window.location.reload();
        }} />
    {/each}
</div>

<!-- Pagination controls -->
{#if pagination && pagination.totalPages > 1}
    <div class="pagination">
        <button on:click={() => changePage(pagination.page - 1)} disabled={pagination.page === 1}>
            Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button on:click={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
            Next
        </button>
    </div>
{/if}

{#if fullScreenPost}
    <FullScreenPost post={fullScreenPost} {canEdit} on:close={closeFullScreen} />
{/if}

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