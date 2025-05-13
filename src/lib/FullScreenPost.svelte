<script>
    import Carousel from '$lib/Carousel.svelte';
    import Comment from '$lib/Comment.svelte';
    import { Hash, Heart, X, Pencil, Trash2, MessageCircle } from 'lucide-svelte';
import { fade } from 'svelte/transition';
    import { createEventDispatcher, onMount } from 'svelte';
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
    let likeId = null;
    let showDeleteConfirm = false;
    let comments = [];
    let topLevelComments = [];
    let commentsByParent = {};
    let newComment = '';
    let showComments = false;
    let isLoadingComments = false;
    let totalComments = 0;

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

    async function loadComments() {
        if (isLoadingComments) return;

        isLoadingComments = true;
        showComments = true;

        try {
            // Fetch all comments for this post with expanded user data
            const result = await pb.collection('comments').getList(1, 100, {
                filter: `post="${post.id}"`,
                expand: 'user',
                sort: 'created'
            });

            comments = result.items;
            totalComments = result.totalItems;

            // Organize comments by parent for threaded display
            organizeComments();
        } catch (error) {
            console.error('Error fetching comments:', error);
            toastStore.trigger({
                message: `Error loading comments: ${error.message}`,
                background: 'variant-filled-error'
            });
        } finally {
            isLoadingComments = false;
        }
    }

    function organizeComments() {
        // Reset storage
        topLevelComments = [];
        commentsByParent = {};

        // First pass: group by parent
        comments.forEach(comment => {
            const parentId = comment.parent;

            if (!parentId) {
                // Top level comment
                topLevelComments.push(comment);
            } else {
                // Reply
                if (!commentsByParent[parentId]) {
                    commentsByParent[parentId] = [];
                }
                commentsByParent[parentId].push(comment);
            }
        });

        // Second pass: attach replies to comments
        function attachReplies(commentList) {
            return commentList.map(comment => {
                const replies = commentsByParent[comment.id] || [];
                return {
                    ...comment,
                    replies: attachReplies(replies)
                };
            });
        }

        topLevelComments = attachReplies(topLevelComments);
    }

    async function submitComment() {
        if (!newComment.trim()) {
            toastStore.trigger({
                message: 'Comment cannot be empty',
                background: 'variant-filled-warning'
            });
            return;
        }

        if (!pb.authStore.isValid) {
            toastStore.trigger({
                message: 'Please log in to comment',
                background: 'variant-filled-warning'
            });
            goto('/login');
            return;
        }

        try {
            const userId = pb.authStore.model.id;

            const data = {
                content: newComment,
                post: post.id,
                user: userId,
                is_edited: false,
                is_hidden: false
            };

            const newCommentRecord = await pb.collection('comments').create(data);

            // Add user data to the new comment for display
            const commentWithUser = {
                ...newCommentRecord,
                expand: {
                    user: {
                        id: userId,
                        username: pb.authStore.model.username
                    }
                },
                replies: []
            };

            // Add to comments list
            comments = [...comments, newCommentRecord];
            topLevelComments = [...topLevelComments, commentWithUser];
            totalComments++;

            // Clear the input
            newComment = '';

            toastStore.trigger({
                message: 'Comment added successfully',
                background: 'variant-filled-success'
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            toastStore.trigger({
                message: `Error adding comment: ${error.message}`,
                background: 'variant-filled-error'
            });
        }
    }

    function handleCommentDeleted(event) {
        const { commentId } = event.detail;

        // Remove the comment from our lists
        comments = comments.filter(c => c.id !== commentId);

        // Re-organize comments to update the UI
        organizeComments();
        totalComments--;

        // No need to call the server again, the Comment component already deleted it
    }

    function handleReplyAdded(event) {
        const { reply, parentId } = event.detail;

        // Add to overall comments list
        comments = [...comments, reply];
        totalComments++;

        // Re-organize to update the UI
        organizeComments();
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

    function toggleComments() {
        if (!showComments) {
            loadComments();
        } else {
            showComments = false;
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

            <!-- User Card -->
            <div class="user-card">
                <div class="avatar">
                    <div class="avatar-image">
                        {post.opName ? post.opName.charAt(0).toUpperCase() : '?'}
                    </div>
                </div>
                <div class="user-info">
                    <p class="user-name">{post.opName || post.op}</p>
                </div>
            </div>

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

                <button
                    class="btn btn-sm {showComments ? 'variant-filled-primary' : 'variant-ghost-primary'} ml-4"
                    on:click={toggleComments}
                >
                    <MessageCircle size={16} class="mr-2" />
                    Comments {totalComments > 0 ? `(${totalComments})` : ''}
                </button>
            </div>

            <!-- Comments Section -->
            {#if showComments}
                <div class="comments-section" transition:fade={{ duration: 200 }}>
                    <h3 class="comments-heading">Comments</h3>

                    <!-- New Comment Form -->
                    <div class="new-comment-form">
                        <textarea
                            bind:value={newComment}
                            placeholder="Add a comment..."
                            class="textarea"
                            rows="2"
                        ></textarea>
                        <button
                            class="btn variant-filled-primary"
                            on:click={submitComment}
                            disabled={!pb.authStore.isValid}
                        >
                            Post
                        </button>
                        {#if !pb.authStore.isValid}
                            <div class="login-prompt">
                                <a href="/login" class="btn btn-sm variant-ghost-surface">Login to comment</a>
                            </div>
                        {/if}
                    </div>

                    <!-- Comments List -->
                    <div class="comments-list">
                        {#if isLoadingComments}
                            <div class="loading">Loading comments...</div>
                        {:else if topLevelComments.length === 0}
                            <div class="no-comments">No comments yet. Be the first to comment!</div>
                        {:else}
                            {#each topLevelComments as comment (comment.id)}
                                <Comment
                                    {comment}
                                    replies={comment.replies || []}
                                    on:commentDeleted={handleCommentDeleted}
                                    on:replyAdded={handleReplyAdded}
                                />
                            {/each}
                        {/if}
                    </div>
                </div>
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
        overflow-y: auto;
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
        margin: 40px 0;
    }

    .carousel-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 60vh;
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
        flex-wrap: wrap;
        gap: 10px;
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

    /* User card styles */
    .user-card {
        display: flex;
        align-items: center;
        background: rgba(50, 50, 50, 0.5);
        padding: 10px;
        border-radius: 10px;
        margin: 15px 0;
        width: fit-content;
        align-self: center;
    }

    .avatar {
        width: 40px;
        height: 40px;
        overflow: hidden;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
    }

    .avatar-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-primary-500);
        color: white;
        font-weight: bold;
        font-size: 18px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-name {
        font-weight: bold;
        margin: 0;
        font-size: 14px;
    }

    /* Comments section styles */
    .comments-section {
        margin-top: 20px;
        width: 100%;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 20px;
    }

    .comments-heading {
        text-align: left;
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .new-comment-form {
        margin-bottom: 20px;
    }

    .textarea {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
        padding: 12px;
        margin-bottom: 10px;
    }

    .new-comment-form button {
        float: right;
    }

    .login-prompt {
        clear: both;
        text-align: center;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px dashed rgba(255, 255, 255, 0.2);
    }

    .comments-list {
        text-align: left;
    }

    .loading, .no-comments {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
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