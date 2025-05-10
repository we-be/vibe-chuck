<script>
    import { writable } from 'svelte/store';
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { onMount } from 'svelte';
    import { events, fetchEvents } from '$lib/stores/events';
    import imageCompression from 'browser-image-compression';
    
    export let data;
    const { post, userId } = data;
    let title = post.title;
    let description = post.description;
    let eventId = post.event;
    let files = [];
    let originalFiles = []; // Store the original files for reference
    let previewUrls = writable([]);
    let isLoading = false;
    let isCompressing = false; // Track compression state
    let compressionProgress = 0; // Track compression progress
    let error = null;
    const toastStore = getToastStore();
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const MAX_DIMENSION = 1920; // Max width or height for images
    const DEFAULT_QUALITY = 0.8; // Default compression quality (0-1)
    
    onMount(async () => {
        // Fetch events if needed
        if ($events.length === 0) {
            await fetchEvents();
        }
    });

    function handleFileSelect(event) {
        originalFiles = Array.from(event.target.files);
        files = originalFiles; // Initially set files to original
        
        // Generate preview URLs for original files
        const urls = originalFiles.map(file => URL.createObjectURL(file));
        previewUrls.set(urls);
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
            const pb = await pbStore.init();
            
            if (!eventId) {
                throw new Error('Please select an event for your post.');
            }
            
            // Check if any files exceed the size limit and compress if needed
            const needsCompression = originalFiles.some(file => file.size > MAX_FILE_SIZE);
            if (needsCompression && originalFiles.length > 0) {
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
            
            // Add compressed images to formdata if any
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
                <span>Upload New Images (optional - Max 10MB per image, larger images will be compressed)</span>
                <input type="file" accept="image/*" multiple on:change={handleFileSelect} class="input px-4 py-2" />
            </label>
            
            {#if $previewUrls.length}
                <div class="flex justify-between items-center mb-2">
                    <p class="text-sm">{$previewUrls.length} new image(s) selected.</p>
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
                    Saving...
                {:else if isCompressing}
                    Compressing Images...
                {:else}
                    Save Changes
                {/if}
            </button>
            
            {#if error}
                <p class="text-error-500">{error}</p>
            {/if}
        </form>
    </div>
</div>