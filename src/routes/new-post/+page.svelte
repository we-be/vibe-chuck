<script>
    import { pbStore } from '$lib/pocketbase';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { events, fetchEvents } from '$lib/stores/events';
    import { onMount } from 'svelte';
    import imageCompression from 'browser-image-compression';

    let eventId = "";
    const toastStore = getToastStore();
    
    onMount(async () => {
        // Fetch events if needed
        if ($events.length === 0) {
            await fetchEvents();
        }
        
        // Don't automatically select an event, let the user choose
        eventId = "";
    });
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const MAX_DIMENSION = 1920; // Max width or height for images
    const DEFAULT_QUALITY = 0.8; // Default compression quality (0-1)

    let title = '';
    let description = '';
    let files = [];
    let originalFiles = []; // Store the original files for reference
    let previewUrls = writable([]);
    let isLoading = false;
    let isCompressing = false; // Track compression state
    let compressionProgress = 0; // Track compression progress
    let error = null;

    function handleFileSelect(event) {
        originalFiles = Array.from(event.target.files);
        files = originalFiles; // Initially set files to original
        
        // Generate preview URLs for original files
        const urls = originalFiles.map(file => URL.createObjectURL(file));
        previewUrls.set(urls);
    }

    function clearFiles() {
        files = [];
        originalFiles = [];
        previewUrls.set([]);
        compressionProgress = 0;
    }

    // Function to compress images that are too large
    async function compressImages() {
        isCompressing = true;
        compressionProgress = 0;
        
        try {
            const compressedFiles = [];
            const totalFiles = originalFiles.length;
            
            // Process each file
            for (let i = 0; i < totalFiles; i++) {
                const file = originalFiles[i];
                
                // If file is already under the size limit, keep it as is
                if (file.size <= MAX_FILE_SIZE) {
                    compressedFiles.push(file);
                } else {
                    // Configure compression options
                    const options = {
                        maxSizeMB: MAX_FILE_SIZE / (1024 * 1024), // Convert bytes to MB
                        maxWidthOrHeight: MAX_DIMENSION,
                        useWebWorker: true,
                        fileType: file.type,
                        initialQuality: DEFAULT_QUALITY,
                        onProgress: (percent) => {
                            compressionProgress = ((i / totalFiles) * 100) + (percent / totalFiles);
                        }
                    };
                    
                    // Compress the image
                    const compressedFile = await imageCompression(file, options);
                    
                    console.log(`Original size: ${file.size / 1024 / 1024} MB`);
                    console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
                    
                    compressedFiles.push(compressedFile);
                }
                
                // Update overall progress
                compressionProgress = ((i + 1) / totalFiles) * 100;
            }
            
            // Update files array with compressed files
            files = compressedFiles;
            
            // Update preview URLs with compressed files
            const urls = compressedFiles.map(file => URL.createObjectURL(file));
            previewUrls.set(urls);
            
            return true;
        } catch (err) {
            console.error('Error compressing images:', err);
            error = `Error compressing images: ${err.message}`;
            
            toastStore.trigger({
                message: error,
                background: 'variant-filled-error'
            });
            
            return false;
        } finally {
            isCompressing = false;
            compressionProgress = 100;
        }
    }

    async function handleSubmit() {
        isLoading = true;
        error = null;

        try {
            const pb = await pbStore.init(); // ensure client is initialized
            
            if (!pb.authStore.isValid) {
                throw new Error('User not authenticated');
            }
            
            if (!eventId) {
                throw new Error('Please select an event for your post.');
            }
            
            // Check if any files exceed the size limit and compress if needed
            const needsCompression = originalFiles.some(file => file.size > MAX_FILE_SIZE);
            if (needsCompression) {
                const compressionSuccess = await compressImages();
                if (!compressionSuccess) {
                    // Compression failed, stop the submission
                    return;
                }
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('event', eventId);
            formData.append('op', pb.authStore.model.id);
            
            // Add images to formdata (already compressed if needed)
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
            
            let errorMessage;
            if (err.message.includes('exceeds the maximum size')) {
                errorMessage = err.message;
            } else if (err.message === 'User not authenticated') {
                errorMessage = 'You must be logged in to create a post.';
            } else {
                errorMessage = `Error creating post: ${err.message}`;
            }
            
            error = errorMessage;

            // show error toast
            toastStore.trigger({
                message: errorMessage,
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
                <span>Event</span>
                <select 
                    class="select px-4 py-2"
                    bind:value={eventId}
                    required
                >
                    <option value="">Select an event</option>
                    {#each $events as event}
                        <option value={event.id}>{event.displayName}</option>
                    {/each}
                </select>
            </label>
            <label class="label">
                <span>Upload Images (Max 10MB per image - larger images will be compressed automatically)</span>
                <input
                    type="file"
                    class="input px-4 py-2"
                    accept="image/*"
                    multiple
                    on:change={handleFileSelect}
                />
            </label>
            {#if files.length > 0}
                <div class="flex justify-between items-center mb-2">
                    <p class="text-sm">{files.length} file(s) selected</p>
                    <button type="button" class="btn variant-filled-secondary" on:click={clearFiles}>Clear Files</button>
                </div>
                
                {#if originalFiles.some(file => file.size > MAX_FILE_SIZE)}
                    <div class="alert variant-soft-warning mb-2">
                        <p class="text-sm">One or more files exceed 10MB and will be compressed during upload.</p>
                    </div>
                {/if}
            {/if}
            
            {#if isCompressing}
                <div class="mb-2">
                    <p class="text-sm">Compressing images: {Math.round(compressionProgress)}%</p>
                    <div class="progress-bar bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div class="bg-primary-500 h-full" style="width: {compressionProgress}%"></div>
                    </div>
                </div>
            {/if}
            
            <button type="submit" class="btn variant-filled-primary w-full" disabled={isLoading || isCompressing}>
                {#if isLoading}
                    Creating Post...
                {:else if isCompressing}
                    Compressing Images...
                {:else}
                    Create Post
                {/if}
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