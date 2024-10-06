<script>
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { fetchEvents } from '$lib/stores/events';
    import { browser } from '$app/environment';

    let Button;
    let Input;

    onMount(async () => {
        if (browser) {
            const module = await import('@skeletonlabs/skeleton');
            Button = module.Button;
            Input = module.Input;
        }
    });

    let pb;
    let isSignUp = false;
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let error = '';
    let loading = false;

    onMount(() => {
        pb = pbStore.init();
    });

    async function loginWithGoogle() {
        try {
            loading = true;
            const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
            
            if (pb.authStore.isValid) {
                console.log('Logged in with token:', pb.authStore.token);
                console.log('User ID:', pb.authStore.model.id);
                
                await fetchEvents();
                goto('/');
            } else {
                console.log('Login failed');
                error = 'Google login failed. Please try again.';
            }
        } catch (err) {
            console.error('Login error:', err);
            error = 'An error occurred during Google login. Please try again.';
        } finally {
            loading = false;
        }
    }

    async function handleSubmit() {
        try {
            loading = true;
            error = '';
            if (isSignUp) {
                if (password !== passwordConfirm) {
                    error = "Passwords don't match";
                    return;
                }
                await pb.collection('users').create({
                    email,
                    password,
                    passwordConfirm
                });
                // Automatically log in after successful sign-up
                await pb.collection('users').authWithPassword(email, password);
            } else {
                await pb.collection('users').authWithPassword(email, password);
            }
            if (pb.authStore.isValid) {
                await fetchEvents();
                goto('/');
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function toggleMode() {
        isSignUp = !isSignUp;
        error = '';
    }
</script>

<div class="flex justify-center items-center min-h-screen bg-surface-100-800-token">
    <div class="card p-8 w-full max-w-md">
        <h1 class="h2 mb-6 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h1>

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <label class="label">
                <span>Email</span>
                {#if Input}
                    <svelte:component this={Input} type="email" bind:value={email} placeholder="Enter your email" required />
                {:else}
                    <input type="email" bind:value={email} placeholder="Enter your email" required class="input" />
                {/if}
            </label>
            <label class="label">
                <span>Password</span>
                {#if Input}
                    <svelte:component this={Input} type="password" bind:value={password} placeholder="Enter your password" required />
                {:else}
                    <input type="password" bind:value={password} placeholder="Enter your password" required class="input" />
                {/if}
            </label>
            {#if isSignUp}
                <label class="label">
                    <span>Confirm Password</span>
                    {#if Input}
                        <svelte:component this={Input} type="password" bind:value={passwordConfirm} placeholder="Confirm your password" required />
                    {:else}
                        <input type="password" bind:value={passwordConfirm} placeholder="Confirm your password" required class="input" />
                    {/if}
                </label>
            {/if}
            {#if Button}
                <svelte:component this={Button} type="submit" variant="filled" color="primary" class="w-full" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span>
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Login'}
                    {/if}
                </svelte:component>
            {:else}
                <button type="submit" class="btn variant-filled-primary w-full" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span>
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Login'}
                    {/if}
                </button>
            {/if}
        </form>

        <div class="mt-4">
            {#if Button}
                <svelte:component this={Button} on:click={toggleMode} variant="ghost" color="secondary" class="w-full">
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </svelte:component>
            {:else}
                <button on:click={toggleMode} class="btn variant-ghost-secondary w-full">
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </button>
            {/if}
        </div>

        <div class="mt-4">
            {#if Button}
                <svelte:component this={Button} on:click={loginWithGoogle} variant="filled" color="surface" class="w-full" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span>
                    {:else}
                        Login with Google
                    {/if}
                </svelte:component>
            {:else}
                <button on:click={loginWithGoogle} class="btn variant-filled-surface w-full" disabled={loading}>
                    {#if loading}
                        <span class="spinner"></span>
                    {:else}
                        Login with Google
                    {/if}
                </button>
            {/if}
        </div>

        {#if error}
            <p class="mt-4 text-sm text-error-500">{error}</p>
        {/if}
    </div>
</div>

<style>
    .spinner {
        display: inline-block;
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>