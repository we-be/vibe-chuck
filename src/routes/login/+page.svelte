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

    async function loginWithOAuth(provider) {
        try {
            loading = true;

            // Debug: Print OAuth providers available in PocketBase
            if (provider === 'instagram' || provider === 'facebook') {
                console.log(`Starting ${provider} OAuth2 flow...`);
                // Debug info for OAuth
                try {
                    const authMethods = await pb.collection('users').listAuthMethods();
                    const providerInfo = authMethods.authProviders.find(p => p.name === provider);
                    console.log('Provider config:', JSON.stringify(providerInfo, null, 2));
                } catch (e) {
                    console.error(`Error getting auth methods for ${provider}:`, e);
                }
            }

            const authData = await pb.collection('users').authWithOAuth2({ provider });

            if (pb.authStore.isValid) {
                console.log(`Logged in with ${provider}. Token:`, pb.authStore.token);
                console.log('User ID:', pb.authStore.model.id);

                await fetchEvents();
                goto('/');
            } else {
                console.log('Login failed');
                error = `${provider} login failed. Please try again.`;
            }
        } catch (err) {
            console.error(`Login error with ${provider}:`, err);
            console.log('Error details:', JSON.stringify(err, null, 2));
            error = `An error occurred during ${provider} login. Please try again.`;
        } finally {
            loading = false;
        }
    }

    function loginWithGoogle() {
        return loginWithOAuth('google');
    }

    function loginWithInstagram() {
        return loginWithOAuth('instagram');
    }

    function loginWithFacebook() {
        return loginWithOAuth('facebook');
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
        <h1 class="h2 mb-8 text-center font-bold text-primary-700 dark:text-primary-400">Login</h1>

        <!-- Manual login form commented out for streamlined experience
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

        <div class="divider my-6">SIGN IN WITH</div>
        -->

        <div class="space-y-4">
            {#if Button}
                <svelte:component this={Button} on:click={loginWithGoogle} variant="filled" color="primary" class="w-full py-3 font-semibold" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                        Continue with Google
                    {/if}
                </svelte:component>
                
                <svelte:component this={Button} on:click={loginWithFacebook} variant="filled" style="background-color: #1877F2; color: white;" class="w-full py-3 font-semibold" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                        </svg>
                        Continue with Facebook
                    {/if}
                </svelte:component>

                <svelte:component this={Button} variant="filled" style="background-color: #E1306C; opacity: 0.7; color: white;" class="w-full py-3 font-semibold" disabled={true}>
                    <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                    Continue with Instagram (Coming Soon)
                </svelte:component>
            {:else}
                <button on:click={loginWithGoogle} class="btn variant-filled-primary w-full py-3 font-semibold" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                        Continue with Google
                    {/if}
                </button>
                
                <button on:click={loginWithFacebook} class="btn w-full py-3 font-semibold" style="background-color: #1877F2; color: white;" disabled={loading}>
                    {#if loading}
                        <span class="spinner mr-2" aria-hidden="true"></span>
                        <span>Connecting...</span>
                    {:else}
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                        </svg>
                        Continue with Facebook
                    {/if}
                </button>

                <button class="btn w-full py-3 font-semibold" style="background-color: #E1306C; opacity: 0.7; color: white;" disabled={true}>
                    <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                    Continue with Instagram (Coming Soon)
                </button>
            {/if}
        </div>
        
        <!-- Toggle sign-up/login mode removed for streamlined login
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
        -->

        {#if error}
            <div class="mt-6 p-3 bg-error-100 dark:bg-error-900/30 border border-error-300 dark:border-error-700 rounded-container-token">
                <p class="text-sm text-error-700 dark:text-error-400" role="alert">{error}</p>
            </div>
        {/if}

        <div class="mt-6 text-center">
            <a href="/privacy" class="text-sm text-primary-500 hover:underline">Privacy Policy</a>
        </div>
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