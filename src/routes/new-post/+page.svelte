<script>
    import { pbStore } from '$lib/pocketbase';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';

    const eventId = "9qpinqrrm25wbdg";
    const toastStore = getToastStore();

    let title = '';
    let description = '';
    let files = [];
    let previewUrls = writable([]);
    let isLoading = false;
    let error = null;

    function handleFileSelect(event) {
        files = event.target.files;
        const urls = [];
        for (let i = 0; i < files.length; i++) {
            urls.push(URL.createObjectURL(files[i]));
        }
        previewUrls.set(urls);
    }

    function clearFiles() {
        files = [];
        previewUrls.set([]);
    }

    async function handleSubmit() {
        isLoading = true;
        error = null;

        try {
            const pb = await pbStore.init(); // ensure client is initialized
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('event', eventId);
            formData.append('op', pb.authStore.model.id); // assume user is authenticated
            
            // add images to formdata
            for (let file of files) {
                formData.append('imgs', file);
            }

            // create the post
            const createdPost = await pb.collection('posts').create(formData);

            console.log('post created:', createdPost);

            // show success toast
            toastStore.trigger({
                message: 'Post created successfully!',
                background: 'variant-filled-success'
            });

            // clear the form
            title = '';
            description = '';
            clearFiles();

            // redirect to event page
            goto(`/events/${eventId}`);
        } catch (err) {
            console.error('error creating post:', err);
            error = err.message;

            // show error toast
            toastStore.trigger({
                message: `Error: ${err.message}`,
                background: 'variant-filled-error'
            });
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="max-w-6xl mx-auto p-4 flex gap-4">
    <div class="card p-4 flex-grow-[2]">
        <header class="card-header text-center mb-4">
            <h2 class="h2">Create New Post</h2>
        </header>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <label class="label">
                <span>Title</span>
                <input
                    class="input px-4 py-2"
                    type="text"
                    placeholder="Enter post title"
                    bind:value={title}
                    required
                />
            </label>
            <label class="label">
                <span>Description</span>
                <textarea
                    class="textarea px-4 py-2"
                    rows="3"
                    placeholder="Enter post description"
                    bind:value={description}
                    required
                ></textarea>
            </label>
            <label class="label">
                <span>Upload Images</span>
                <input
                    type="file"
                    class="input px-4 py-2"
                    accept="image/*"
                    multiple
                    on:change={handleFileSelect}
                />
            </label>
            {#if files.length > 0}
                <p class="text-sm">{files.length} file(s) selected</p>
                <button type="button" class="btn variant-filled-secondary" on:click={clearFiles}>Clear Files</button>
            {/if}
            <button type="submit" class="btn variant-filled-primary w-full" disabled={isLoading}>
                {isLoading ? 'Creating Post...' : 'Create Post'}
            </button>
            {#if error}
                <p class="text-error-500">{error}</p>
            {/if}
        </form>
    </div>
    <div class="card p-4 flex-grow-[1]">
        {#if $previewUrls.length === 0}
            <p class="text-center italic text-sm">no images selected</p>
        {:else}
            <div class="grid grid-cols-2 gap-2">
                <div class="grid gap-4">
                    {#each $previewUrls.filter((_, i) => i % 2 === 0) as url}
                        <div>
                            <img src={url} alt="Preview" class="h-auto max-w-full rounded-lg" />
                        </div>
                    {/each}
                </div>
                <div class="grid gap-4">
                    {#each $previewUrls.filter((_, i) => i % 2 !== 0) as url}
                        <div>
                            <img src={url} alt="Preview" class="h-auto max-w-full rounded-lg" />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>