<script>
    import Carousel from '$lib/Carousel.svelte';
    import { Hash, Heart, Pencil, Trash2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { createEventDispatcher, onMount } from 'svelte';
    import { pbStore } from '$lib/pocketbase';
    import { getToastStore } from '@skeletonlabs/skeleton';

    const dispatch = createEventDispatcher();
    const pb = pbStore.init();
    const toastStore = getToastStore();

    export let post;
    export let canEdit = false;
    let liked = false;
    let votes = post.votes || 0;
    let likeId = null;
    let showDeleteConfirm = false;
    
    onMount(async () => {
        if (pb.authStore.isValid) {
            await checkUserLike();
        }
    });

    async function checkUserLike() {
        try {
            const userId = pb.authStore.model.id;
            
            const result = await pb.collection('likes').getList(1, 1, {
                filter: `user="${userId}" && post="${post.id}"`,
            });
            
            if (result.items.length > 0) {
                liked = true;
                likeId = result.items[0].id;
            }
        } catch (error) {
            console.error('Error checking if user liked post:', error);
        }
    }

    async function toggleLike() {
        if (!pb.authStore.isValid) {
            goto('/login');
            return;
        }

        try {
            const userId = pb.authStore.model.id;
            
            if (!liked) {
                // Create a new like
                const newLike = await pb.collection('likes').create({
                    user: userId,
                    post: post.id
                });
                likeId = newLike.id;
                liked = true;
                votes += 1;
            } else if (likeId) {
                // Delete the existing like
                await pb.collection('likes').delete(likeId);
                likeId = null;
                liked = false;
                votes -= 1;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert UI changes if the API call fails
            liked = !liked;
            votes += liked ? 1 : -1;
        }
    }

    function editPost() {
        goto(`/users/${post.op}/posts/${post.id}/edit`)
    }
    
    function openDeleteConfirm(event) {
        event.stopPropagation();
        showDeleteConfirm = true;
    }
    
    function closeDeleteConfirm(event) {
        if (event) event.stopPropagation();
        showDeleteConfirm = false;
    }
    
    async function deletePost(event) {
        event.stopPropagation();
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
            
            // Notify parent component that post was deleted
            dispatch('postDeleted', { postId: post.id });
            
            toastStore.trigger({
                message: 'Post deleted successfully',
                background: 'variant-filled-success'
            });
            
            // Close delete confirmation
            showDeleteConfirm = false;
            
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

    function formatVotes(count) {
        if (count < 1000) return count.toString();
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith('.0') 
            ? formatted.slice(0, -2) + 'K' 
            : formatted + 'K';
    }

    function handleClick() {
        dispatch('openFullScreen', { post });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="card card-hover m-4" on:click={handleClick}>
    <div class="card-content">
        <Carousel perPage={1} autoplay={5000}>
            {#each post.imgs as imgSrc (imgSrc)}
                <div class="carousel-slide">
                    <img src={imgSrc} alt={post.title} />
                </div>
            {/each}
            <div slot="left-control">←</div>
            <div slot="right-control">→</div>
        </Carousel>
        <div class="text-overlay">
            <div class="title-container">
                <h2>{post.title}</h2>
                {#if post.hasRank && post.rank}
                    <span class="badge-icon variant-filled-primary">
                        <Hash size={9} />
                        <span>{post.rank}</span>
                    </span>
                {:else if !post.hasRank}
                    <span class="badge-icon variant-filled-secondary">
                        <Hash size={9} />
                        <span>New</span>
                    </span>
                {/if}
            </div>
            {#if !canEdit}
                <p class="op"><i><sub>@{post.opName || post.op}</sub></i></p>
            {/if}
            {#if post.description}
                <p class="event">{post.description}</p>
            {/if}
        </div>
        <div class="heart-container">
            {#if !canEdit}
                <button class="icon-button heart-button" on:click|stopPropagation={toggleLike} aria-label="Like">
                    <Heart fill={liked ? 'currentColor' : 'none'} />
                </button>
                <p class="votes"><sub>{formatVotes(votes)}</sub></p>
            {:else}
                <button class="icon-button edit-button" on:click|stopPropagation={editPost} aria-label="Edit">
                    <Pencil />
                </button>
                <button class="icon-button trash-button" on:click|stopPropagation={openDeleteConfirm} aria-label="Delete">
                    <Trash2 />
                </button>
            {/if}
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
    .card {
        border-radius: 1rem;
        overflow: hidden;
    }

    .card-content {
        position: relative;
        overflow: hidden;
        border-radius: 1rem;
    }

    .carousel-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .text-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(to top, 
            rgba(0,0,0,0.8) 0%, 
            rgba(0,0,0,0.7) 20%,
            rgba(0,0,0,0.6) 40%,
            rgba(0,0,0,0.4) 60%,
            rgba(0,0,0,0.2) 80%,
            rgba(0,0,0,0) 100%);
    }

    .title-container {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    h2 {
        margin: 0;
        margin-right: 10px;
        font-size: 1.5rem;
        color: white;
    }

    .op {
        margin-bottom: 5px;
        color: white;
    }

    .event {
        font-size: 0.9rem;
        color: white;
    }

    .heart-container {
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .icon-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .icon-button :global(svg) {
        width: 24px;
        height: 24px;
    }

    .trash-button:hover {
        background-color: rgba(255, 0, 0, 0.2);
        color: #ff6b6b;
    }

    .votes {
        margin-top: 4px;
        font-size: 0.8rem;
        color: white;
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
        z-index: 1000;
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