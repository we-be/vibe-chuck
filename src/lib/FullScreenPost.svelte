<script>
    import Carousel from '$lib/Carousel.svelte';
    import { Hash, Heart, X, Pencil, Trash2 } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import { pbStore } from '$lib/pocketbase';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { goto } from '$app/navigation';

    const dispatch = createEventDispatcher();
    const pb = pbStore.init();
    const toastStore = getToastStore();

    export let post;
    export let canEdit = false;
    let liked = false;
    let votes = post.votes || 0;
    let showDeleteConfirm = false;

    function toggleLike() {
        liked = !liked;
        votes += liked ? 1 : -1;
        // TODO hit api
    }

    function formatVotes(count) {
        if (count < 1000) return count.toString();
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith('.0') 
            ? formatted.slice(0, '-2') + 'K' 
            : formatted + 'K';
    }

    function close() {
        dispatch('close');
    }
    
    function editPost() {
        goto(`/users/${post.op}/posts/${post.id}/edit`);
        close();
    }
    
    function openDeleteConfirm() {
        showDeleteConfirm = true;
    }
    
    function closeDeleteConfirm() {
        showDeleteConfirm = false;
    }
    
    async function deletePost() {
        try {
            // Check if the user is authorized to delete the post
            if (!pb.authStore.isValid) {
                toastStore.trigger({
                    message: 'You must be logged in to delete posts',
                    background: 'variant-filled-error'
                });
                return;
            }
            
            const userId = pb.authStore.model.id;
            if (post.op !== userId) {
                toastStore.trigger({
                    message: 'You can only delete your own posts',
                    background: 'variant-filled-error'
                });
                return;
            }
            
            // Delete the post
            await pb.collection('posts').delete(post.id);
            
            // Show success message
            toastStore.trigger({
                message: 'Post deleted successfully',
                background: 'variant-filled-success'
            });
            
            // Close delete confirmation and full screen view
            showDeleteConfirm = false;
            close();
            
            // Refresh the page to update the posts list
            window.location.reload();
        } catch (error) {
            console.error('Error deleting post:', error);
            toastStore.trigger({
                message: `Error deleting post: ${error.message}`,
                background: 'variant-filled-error'
            });
        }
    }
</script>

<div class="full-screen-post">
    <button class="close-button" on:click={close} aria-label="Close">
        <X />
    </button>
    <div class="content">
        <Carousel perPage={1} autoplay={0} controls={true}>
            {#each post.imgs as imgSrc (imgSrc)}
                <div class="carousel-slide">
                    <img src={imgSrc} alt={post.title} />
                </div>
            {/each}
        </Carousel>
        <div class="info">
            <h2>{post.title}</h2>
            {#if post.rank}
                <span class="badge-icon variant-filled-primary">
                    <Hash size={9} />
                    <span>{post.rank}</span>
                </span>
            {/if}
            <p class="op"><i>@{post.opName || post.op}</i></p>
            {#if post.description}
                <p class="description">{post.description}</p>
            {/if}
            
            <div class="action-container">
                {#if !canEdit}
                    <div class="heart-container">
                        <button class="icon-button heart-button" on:click={toggleLike} aria-label="Like">
                            <Heart fill={liked ? 'currentColor' : 'none'} />
                        </button>
                        <p class="votes">{formatVotes(votes)}</p>
                    </div>
                {:else}
                    <div class="edit-buttons">
                        <button class="btn variant-filled-primary" on:click={editPost}>
                            <Pencil size={16} class="mr-2" />
                            Edit
                        </button>
                        <button class="btn variant-filled-error" on:click={openDeleteConfirm}>
                            <Trash2 size={16} class="mr-2" />
                            Delete
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    {#if showDeleteConfirm}
        <div class="delete-confirm-overlay" on:click|stopPropagation={closeDeleteConfirm}>
            <div class="delete-confirm-modal" on:click|stopPropagation={() => {}}>
                <h3>Delete Post</h3>
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                <div class="button-container">
                    <button class="btn variant-filled-error" on:click={deletePost}>Delete</button>
                    <button class="btn variant-filled-surface" on:click={closeDeleteConfirm}>Cancel</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .full-screen-post {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }

    .content {
        width: 90%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .carousel-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 70vh;
    }

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .info {
        color: white;
        text-align: center;
        margin-top: 20px;
        width: 100%;
    }

    h2 {
        margin: 0;
        font-size: 24px;
    }

    .op, .description {
        margin: 10px 0;
    }
    
    .action-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .heart-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        color: white;
    }

    .votes {
        margin-left: 10px;
    }
    
    .edit-buttons {
        display: flex;
        gap: 10px;
    }
    
    /* Delete confirmation modal styles */
    .delete-confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
    }
    
    .delete-confirm-modal {
        background-color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        color: #333;
    }
    
    .delete-confirm-modal h3 {
        margin-top: 0;
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1rem;
    }
    
    .delete-confirm-modal p {
        margin-bottom: 1.5rem;
    }
    
    .button-container {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }
</style>