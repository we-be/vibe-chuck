<script>
    import { onMount } from 'svelte';
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { MessageCircle } from 'lucide-svelte';

    let pb;
    let user;
    let name = '';
    let email = '';
    let location = '';
    let locations = [];
    let avatarFile = null;
    let previewAvatarUrl = '';
    let existingAvatarUrl = '';
    let isLoading = false;
    let error = '';
    let activeTab = 'profile';
    let userComments = [];
    let isLoadingComments = false;

    const toastStore = getToastStore();

    onMount(async () => {
        pb = await pbStore.init();
        if (!pb.authStore.isValid) {
            goto('/login');
            return;
        }
        user = pb.authStore.model;

        try {
            const record = await pb.collection('users').getOne(user.id, { expand: 'location' });
            name = record.name || '';
            email = record.email || '';
            if (record.expand?.location) {
                location = record.expand.location.id;
            } else if (record.location) {
                location = record.location;
            }
            if (record.avatar) {
                // Handle single or multiple avatar files
                const avatarName = Array.isArray(record.avatar) ? record.avatar[0] : record.avatar;
                existingAvatarUrl = pb.getFileUrl(record, avatarName);
            }
        } catch (err) {
            console.error('Failed to load user data:', err);
            error = 'Failed to load user data.';
            toastStore.trigger({ message: error, background: 'variant-filled-error' });
        }

        try {
            locations = await pb.collection('wkgf7uttc4lj0mt').getFullList(200);
        } catch (err) {
            console.error('Failed to load locations:', err);
        }

        // Load user comments if on comments tab
        if (activeTab === 'comments') {
            loadUserComments();
        }
    });

    async function loadUserComments() {
        if (isLoadingComments) return;

        isLoadingComments = true;

        try {
            // Get user comments with expanded post data
            const result = await pb.collection('comments').getList(1, 50, {
                filter: `user="${user.id}"`,
                expand: 'post',
                sort: '-created'
            });

            userComments = result.items;
        } catch (err) {
            console.error('Failed to load user comments:', err);
            toastStore.trigger({
                message: 'Failed to load your comments',
                background: 'variant-filled-error'
            });
        } finally {
            isLoadingComments = false;
        }
    }

    function setActiveTab(tab) {
        activeTab = tab;
        if (tab === 'comments') {
            loadUserComments();
        }
    }

    async function viewPost(postId) {
        try {
            // First we need to find which event the post belongs to
            const post = await pb.collection('posts').getOne(postId);
            if (post && post.event) {
                // Then navigate to the event page where the post will be visible
                goto(`/events/${post.event}`);
            } else {
                // If we can't determine the event, go to home
                toastStore.trigger({
                    message: 'Could not find the post',
                    background: 'variant-filled-warning'
                });
                goto('/');
            }
        } catch (error) {
            console.error('Error finding post:', error);
            toastStore.trigger({
                message: 'Error finding post',
                background: 'variant-filled-error'
            });
        }
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
            avatarFile = file;
            previewAvatarUrl = URL.createObjectURL(file);
        } else {
            avatarFile = null;
            previewAvatarUrl = '';
        }
    }

    async function handleSubmit() {
        isLoading = true;
        error = '';
        const formData = new FormData();
        formData.append('name', name);
        if (location) {
            formData.append('location', location);
        }
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        try {
            const updated = await pb.collection('users').update(user.id, formData);
            toastStore.trigger({ message: 'Account updated successfully!', background: 'variant-filled-success' });
            if (updated.avatar) {
                const avatarName = Array.isArray(updated.avatar) ? updated.avatar[0] : updated.avatar;
                existingAvatarUrl = pb.getFileUrl(updated, avatarName);
                previewAvatarUrl = '';
                avatarFile = null;
            }
        } catch (err) {
            console.error('Failed to update account:', err);
            error = err.message || 'Failed to update account.';
            toastStore.trigger({ message: error, background: 'variant-filled-error' });
        } finally {
            isLoading = false;
        }
    }
    // Logout user and redirect to login page
    async function logout() {
        const client = await pbStore.init();
        client.authStore.clear();
        goto('/login');
    }
</script>

<div class="max-w-6xl mx-auto p-4">
    <div class="card p-4">
        <header class="card-header text-center mb-4">
            <h2 class="h2">My Account</h2>

            <!-- Tab Navigation -->
            <div class="tab-group flex justify-center mt-4">
                <button
                    class="tab {activeTab === 'profile' ? 'tab-active variant-filled-primary' : 'variant-ghost-surface'}"
                    on:click={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    class="tab {activeTab === 'comments' ? 'tab-active variant-filled-primary' : 'variant-ghost-surface'}"
                    on:click={() => setActiveTab('comments')}
                >
                    <MessageCircle size={16} class="mr-1" /> My Comments
                </button>
            </div>
        </header>

        <!-- Profile Tab -->
        {#if activeTab === 'profile'}
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <label class="label">
                    <span>Email</span>
                    <input type="email" bind:value={email} disabled class="input px-4 py-2" />
                </label>
                <label class="label">
                    <span>Name</span>
                    <input type="text" bind:value={name} placeholder="Your name" class="input px-4 py-2" />
                </label>
                <label class="label">
                    <span>Location</span>
                    <select bind:value={location} class="input px-4 py-2">
                        <option value="">Select location</option>
                        {#each locations as loc}
                            <option value={loc.id}>{loc.name || loc.id}</option>
                        {/each}
                    </select>
                </label>
                <label class="label">
                    <span>Avatar</span>
                    <input type="file" accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp" on:change={handleAvatarChange} class="input px-4 py-2" />
                </label>
                {#if previewAvatarUrl}
                    <div>
                        <p class="text-sm mb-2">Preview:</p>
                        <img src={previewAvatarUrl} alt="Avatar Preview" class="h-24 w-24 object-cover rounded-full" />
                    </div>
                {:else if existingAvatarUrl}
                    <div>
                        <p class="text-sm mb-2">Current Avatar:</p>
                        <img src={existingAvatarUrl} alt="Current Avatar" class="h-24 w-24 object-cover rounded-full" />
                    </div>
                {/if}
                <button type="submit" class="btn variant-filled-primary w-full" disabled={isLoading}>
                    {#if isLoading}
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </button>
                {#if error}
                    <p class="text-error-500">{error}</p>
                {/if}
            </form>
        {/if}

        <!-- Comments Tab -->
        {#if activeTab === 'comments'}
            <div class="comments-container">
                <h3 class="h3 mb-4">Your Comments</h3>

                {#if isLoadingComments}
                    <div class="flex justify-center p-4">
                        <span class="loading loading-spinner loading-lg"></span>
                    </div>
                {:else if userComments.length === 0}
                    <div class="text-center p-6 bg-surface-100-800-token rounded-lg">
                        <MessageCircle size={32} class="mx-auto mb-2 text-primary-500" />
                        <p>You haven't made any comments yet.</p>
                        <p class="text-sm mt-2 opacity-70">Your comments on posts will appear here.</p>
                    </div>
                {:else}
                    <div class="grid gap-4">
                        {#each userComments as comment}
                            <div class="card p-4 bg-surface-100-800-token">
                                <div class="comment-date text-sm opacity-70 mb-1">
                                    {formatDate(comment.created)}
                                    {#if comment.is_edited}
                                        <span class="italic ml-2">(edited)</span>
                                    {/if}
                                </div>
                                <div class="comment-content mb-2">
                                    {comment.content}
                                </div>
                                <div class="comment-post flex items-center space-x-2">
                                    <span class="text-sm">On post:</span>
                                    <button
                                        class="btn btn-sm variant-ghost-primary"
                                        on:click={() => viewPost(comment.post)}
                                    >
                                        {comment.expand?.post?.title || 'View Post'}
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}

        <div class="mt-8">
            <button type="button" class="btn variant-ghost-secondary w-full" on:click={logout}>
                Logout
            </button>
        </div>
    </div>
</div>

<style>
    .loading {
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 3px solid var(--color-primary-500);
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
