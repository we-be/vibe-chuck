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

<div class="flex justify-center items-center min-h-screen bg-gradient-to-b from-surface-900 to-surface-800">
    <div class="card p-8 w-full max-w-md shadow-xl bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-600">
        <h1 class="h2 mb-8 text-center font-bold text-primary-700 dark:text-primary-400">{isSignUp ? 'Sign Up' : 'Login'}</h1>

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="form-group">
                <label for="email" class="label font-medium text-surface-700 dark:text-surface-300">Email</label>
                {#if Input}
                    <svelte:component this={Input} type="email" id="email" bind:value={email} placeholder="Enter your email" required class="mt-1" />
                {:else}
                    <input type="email" id="email" bind:value={email} placeholder="Enter your email" required class="input mt-1" />
                {/if}
            </div>
            <div class="form-group">
                <label for="password" class="label font-medium text-surface-700 dark:text-surface-300">Password</label>
                {#if Input}
                    <svelte:component this={Input} type="password" id="password" bind:value={password} placeholder="Enter your password" required class="mt-1" />
                {:else}
                    <input type="password" id="password" bind:value={password} placeholder="Enter your password" required class="input mt-1" />
                {/if}
            </div>
            {#if isSignUp}
                <div class="form-group">
                    <label for="passwordConfirm" class="label font-medium text-surface-700 dark:text-surface-300">Confirm Password</label>
                    {#if Input}
                        <svelte:component this={Input} type="password" id="passwordConfirm" bind:value={passwordConfirm} placeholder="Confirm your password" required class="mt-1" />
                    {:else}
                        <input type="password" id="passwordConfirm" bind:value={passwordConfirm} placeholder="Confirm your password" required class="input mt-1" />
                    {/if}
                </div>
            {/if}
            {#if Button}
                <svelte:component this={Button} type="submit" variant="filled" color="primary" class="w-full py-3 font-semibold" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>{isSignUp ? 'Signing Up...' : 'Logging In...'}</span>
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Login'}
                    {/if}
                </svelte:component>
            {:else}
                <button type="submit" class="btn variant-filled-primary w-full py-3 font-semibold" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>{isSignUp ? 'Signing Up...' : 'Logging In...'}</span>
                    {:else}
                        {isSignUp ? 'Sign Up' : 'Login'}
                    {/if}
                </button>
            {/if}
        </form>

        <div class="divider my-6">OR</div>

        <div class="mb-6">
            {#if Button}
                <svelte:component this={Button} on:click={loginWithGoogle} variant="soft" color="surface" class="w-full py-3" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                        Login with Google
                    {/if}
                </svelte:component>
            {:else}
                <button on:click={loginWithGoogle} class="btn variant-soft-surface w-full py-3" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                        Login with Google
                    {/if}
                </button>
            {/if}
        </div>

        <div class="text-center">
            {#if Button}
                <svelte:component this={Button} on:click={toggleMode} variant="ghost" color="secondary" class="font-medium">
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </svelte:component>
            {:else}
                <button on:click={toggleMode} class="btn variant-ghost-secondary font-medium">
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </button>
            {/if}
        </div>

        {#if error}
            <div class="mt-6 p-3 bg-error-100 dark:bg-error-900/30 border border-error-300 dark:border-error-700 rounded-container-token">
                <p class="text-sm text-error-700 dark:text-error-400" role="alert">{error}</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .spinner {
        display: inline-block;
        width: 1.2em;
        height: 1.2em;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s ease-in-out infinite;
        vertical-align: middle;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group .label {
        margin-bottom: 0.25rem;
    }
    
    .divider {
        display: flex;
        align-items: center;
        text-align: center;
        font-size: 0.875rem;
        color: var(--color-surface-500);
    }
    
    .divider::before,
    .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--color-surface-300);
        margin: 0 0.75rem;
    }
</style>