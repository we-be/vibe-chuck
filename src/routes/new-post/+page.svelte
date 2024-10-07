<script>
    let title = '';
    let description = '';
    let location = '';
    let files = [];

    function handleSubmit() {
        // Here you would typically handle the form submission
        console.log({ title, description, location, files });
    }

    function handleFileSelect(event) {
        files = event.target.files;
    }
</script>

<div class="max-w-2xl mx-auto p-4">
    <div class="card p-4">
        <header class="card-header text-center mb-4">
            <h2 class="h2">Create New Post</h2>
        </header>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <label class="label">
                <span>Title</span>
                <input
                    class="input"
                    type="text"
                    placeholder="Enter post title"
                    bind:value={title}
                    required
                />
            </label>
            <label class="label">
                <span>Description</span>
                <textarea
                    class="textarea"
                    rows="3"
                    placeholder="Enter post description"
                    bind:value={description}
                    required
                ></textarea>
            </label>
            <label class="label">
                <span>Location (optional)</span>
                <input
                    class="input"
                    type="text"
                    placeholder="Enter location"
                    bind:value={location}
                />
            </label>
            <label class="label">
                <span>Upload Images</span>
                <input
                    type="file"
                    class="input"
                    accept="image/*"
                    multiple
                    on:change={handleFileSelect}
                />
            </label>
            {#if files.length > 0}
                <p class="text-sm">{files.length} file(s) selected</p>
            {/if}
            <button type="submit" class="btn variant-filled-primary w-full">Create Post</button>
        </form>
    </div>
</div>