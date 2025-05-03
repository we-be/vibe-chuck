<script>
    import { onMount } from 'svelte';
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';

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
    });

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
            <h2 class="h2">Account Settings</h2>
        </header>
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
        <div class="mt-4">
            <button type="button" class="btn variant-ghost-secondary w-full" on:click={logout}>
                Logout
            </button>
        </div>
    </div>
</div>
