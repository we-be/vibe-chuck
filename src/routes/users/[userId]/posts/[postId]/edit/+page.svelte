<script>
    import { writable } from 'svelte/store';
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    export let data;
    const { post, userId } = data;
    let title = post.title;
    let description = post.description;
    let files = [];
    let previewUrls = writable([]);
    let isLoading = false;
    let error = null;
    const toastStore = getToastStore();

    function handleFileSelect(event) {
        files = event.target.files;
        const urls = Array.from(files).map(file => URL.createObjectURL(file));
        previewUrls.set(urls);
    }

    async function handleSubmit() {
        isLoading = true;
        error = null;
        try {
            const pb = await pbStore.init();
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('event', post.event);
            for (const file of files) {
                formData.append('imgs', file);
            }
            await pb.collection('posts').update(post.id, formData);
            toastStore.trigger({ message: 'Post updated successfully!', background: 'variant-filled-success' });
            goto(`/users/${userId}/posts?page=1&perPage=10`);
        } catch (err) {
            console.error('Failed to update post:', err);
            error = err.message || 'Failed to update post.';
            toastStore.trigger({ message: error, background: 'variant-filled-error' });
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-6xl mx-auto p-4">
    <div class="card p-4">
        <header class="card-header text-center mb-4">
            <h2 class="h2">Edit Post</h2>
        </header>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <label class="label">
                <span>Title</span>
                <input type="text" bind:value={title} class="input px-4 py-2" required />
            </label>
            <label class="label">
                <span>Description</span>
                <textarea bind:value={description} class="textarea px-4 py-2" rows="3" required />
            </label>
            <label class="label">
                <span>Upload New Images (optional)</span>
                <input type="file" accept="image/*" multiple on:change={handleFileSelect} class="input px-4 py-2" />
            </label>
            {#if $previewUrls.length}
                <p class="text-sm">{$previewUrls.length} new image(s) selected.</p>
            {/if}
            <button type="submit" class="btn variant-filled-primary w-full" disabled={isLoading}>
                {#if isLoading}Saving...{:else}Save Changes{/if}
            </button>
            {#if error}
                <p class="text-error-500">{error}</p>
            {/if}
        </form>
    </div>
</div>