<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { pbStore } from '$lib/pocketbase';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { Reply, Edit, Trash2, Flag } from 'lucide-svelte';
    import { goto } from '$app/navigation';

    const dispatch = createEventDispatcher();
    const pb = pbStore.init();
    const toastStore = getToastStore();

    export let comment;
    export let replies = [];
    export let depth = 0;
    export let parentId = null;
    export let showReplies = true;

    let isEditing = false;
    let isReplying = false;
    let editedContent = comment.content;
    let replyContent = '';
    let showDeleteConfirm = false;
    let userData = null;

    onMount(async () => {
        try {
            // Fetch user data for the comment
            userData = await pb.collection('users').getOne(comment.user);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    });

    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 604800)}w ago`;
    }

    function toggleReply() {
        if (!pb.authStore.isValid) {
            toastStore.trigger({
                message: 'Please log in to reply to comments',
                background: 'variant-filled-warning'
            });
            goto('/login');
            return;
        }
        isReplying = !isReplying;
        if (!isReplying) {
            replyContent = '';
        }
    }

    function toggleEdit() {
        isEditing = !isEditing;
        if (!isEditing) {
            editedContent = comment.content;
        }
    }

    function openDeleteConfirm() {
        showDeleteConfirm = true;
    }

    function closeDeleteConfirm() {
        showDeleteConfirm = false;
    }

    async function saveEdit() {
        if (!editedContent.trim()) {
            toastStore.trigger({
                message: 'Comment cannot be empty',
                background: 'variant-filled-warning'
            });
            return;
        }

        try {
            await pb.collection('comments').update(comment.id, {
                content: editedContent,
                is_edited: true
            });

            comment.content = editedContent;
            comment.is_edited = true;
            isEditing = false;

            toastStore.trigger({
                message: 'Comment updated successfully',
                background: 'variant-filled-success'
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            toastStore.trigger({
                message: `Error updating comment: ${error.message}`,
                background: 'variant-filled-error'
            });
        }
    }

    async function submitReply() {
        if (!replyContent.trim()) {
            toastStore.trigger({
                message: 'Reply cannot be empty',
                background: 'variant-filled-warning'
            });
            return;
        }

        try {
            const userId = pb.authStore.model.id;
            
            const newReply = await pb.collection('comments').create({
                content: replyContent,
                post: comment.post,
                user: userId,
                parent: parentId || comment.id,
                reply_to: comment.id,
                is_edited: false,
                is_hidden: false
            });
            
            isReplying = false;
            replyContent = '';
            
            // Fetch user data for the newly created reply
            const replyWithUser = {
                ...newReply,
                expand: {
                    user: {
                        id: userId,
                        username: pb.authStore.model.username
                    }
                }
            };
            
            // Add the new reply to the list
            dispatch('replyAdded', { 
                reply: replyWithUser, 
                parentId: parentId || comment.id 
            });
            
            toastStore.trigger({
                message: 'Reply added successfully',
                background: 'variant-filled-success'
            });
        } catch (error) {
            console.error('Error submitting reply:', error);
            toastStore.trigger({
                message: `Error submitting reply: ${error.message}`,
                background: 'variant-filled-error'
            });
        }
    }

    async function deleteComment() {
        try {
            if (!pb.authStore.isValid) {
                toastStore.trigger({
                    message: 'You must be logged in to delete comments',
                    background: 'variant-filled-error'
                });
                return;
            }
            
            const userId = pb.authStore.model.id;
            if (comment.user !== userId) {
                toastStore.trigger({
                    message: 'You can only delete your own comments',
                    background: 'variant-filled-error'
                });
                return;
            }
            
            // Delete the comment
            await pb.collection('comments').delete(comment.id);
            
            // Notify parent component that comment was deleted
            dispatch('commentDeleted', { commentId: comment.id });
            
            closeDeleteConfirm();
            
            toastStore.trigger({
                message: 'Comment deleted successfully',
                background: 'variant-filled-success'
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toastStore.trigger({
                message: `Error deleting comment: ${error.message}`,
                background: 'variant-filled-error'
            });
        }
    }

    function canUserModify() {
        return pb.authStore.isValid && pb.authStore.model.id === comment.user;
    }
</script>

<div class="comment" style="margin-left: {depth * 20}px;">
    <div class="comment-user">
        <div class="avatar">
            <div class="avatar-image">
                {#if userData?.username}
                    {userData.username.charAt(0).toUpperCase()}
                {:else}
                    ?
                {/if}
            </div>
        </div>
        <div class="comment-meta">
            <div class="comment-author">
                {userData?.username || 'Unknown User'}
                {#if comment.is_edited}
                    <span class="edited-tag">(edited)</span>
                {/if}
            </div>
            <div class="comment-time">{getTimeAgo(comment.created)}</div>
        </div>
    </div>

    {#if isEditing}
        <div class="comment-edit">
            <textarea bind:value={editedContent} class="input" rows="3"></textarea>
            <div class="edit-actions">
                <button class="btn btn-sm variant-filled-primary" on:click={saveEdit}>Save</button>
                <button class="btn btn-sm variant-ghost-surface" on:click={toggleEdit}>Cancel</button>
            </div>
        </div>
    {:else}
        <div class="comment-content">
            {comment.content}
        </div>
    {/if}

    <div class="comment-actions">
        <button class="btn btn-sm variant-ghost-surface" on:click={toggleReply}>
            <Reply size={14} class="mr-1" /> Reply
        </button>
        
        {#if canUserModify()}
            <button class="btn btn-sm variant-ghost-surface" on:click={toggleEdit}>
                <Edit size={14} class="mr-1" /> Edit
            </button>
            <button class="btn btn-sm variant-ghost-surface" on:click={openDeleteConfirm}>
                <Trash2 size={14} class="mr-1" /> Delete
            </button>
        {:else}
            <button class="btn btn-sm variant-ghost-surface">
                <Flag size={14} class="mr-1" /> Report
            </button>
        {/if}
    </div>

    {#if isReplying}
        <div class="reply-form">
            <textarea 
                bind:value={replyContent} 
                placeholder="Write a reply..." 
                class="textarea" 
                rows="2"
            ></textarea>
            <div class="reply-actions">
                <button class="btn btn-sm variant-filled-primary" on:click={submitReply}>Reply</button>
                <button class="btn btn-sm variant-ghost-surface" on:click={toggleReply}>Cancel</button>
            </div>
        </div>
    {/if}

    {#if showReplies && replies.length > 0}
        <div class="replies">
            {#each replies as reply (reply.id)}
                <svelte:self 
                    comment={reply} 
                    replies={reply.replies || []} 
                    depth={depth + 1} 
                    parentId={parentId || comment.id}
                    on:commentDeleted
                    on:replyAdded
                />
            {/each}
        </div>
    {/if}

    <!-- Delete Confirmation Modal -->
    {#if showDeleteConfirm}
        <div class="delete-confirm-overlay" on:click|stopPropagation={closeDeleteConfirm}>
            <div class="delete-confirm-modal" on:click|stopPropagation={() => {}}>
                <h3>Delete Comment</h3>
                <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
                <div class="button-container">
                    <button class="btn variant-filled-error" on:click={deleteComment}>Delete</button>
                    <button class="btn variant-filled-surface" on:click={closeDeleteConfirm}>Cancel</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .comment {
        background: rgba(50, 50, 50, 0.3);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        border-left: 3px solid var(--color-primary-500);
    }

    .comment-user {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .avatar {
        width: 32px;
        height: 32px;
        overflow: hidden;
        border-radius: 50%;
        margin-right: 10px;
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
        font-size: 14px;
    }

    .comment-meta {
        display: flex;
        flex-direction: column;
    }

    .comment-author {
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
    }

    .edited-tag {
        font-size: 12px;
        opacity: 0.7;
        margin-left: 5px;
        font-style: italic;
    }

    .comment-time {
        font-size: 12px;
        opacity: 0.7;
    }

    .comment-content {
        margin: 8px 0;
        word-break: break-word;
        white-space: pre-wrap;
    }

    .comment-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }

    .reply-form, .comment-edit {
        margin-top: 12px;
        margin-bottom: 12px;
    }

    .textarea, .input {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
        padding: 8px;
        margin-bottom: 8px;
    }

    .reply-actions, .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .replies {
        margin-top: 12px;
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
        z-index: 1200;
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