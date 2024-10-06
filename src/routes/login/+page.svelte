<script>
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let pb;
    let isSignUp = false;
    let email = '';
    let password = '';
    let passwordConfirm = '';
    let error = '';

    onMount(() => {
        pb = pbStore.init();
    });

    async function loginWithGoogle() {
        try {
            const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
            
            if (pb.authStore.isValid) {
                console.log('Logged in with token:', pb.authStore.token);
                console.log('User ID:', pb.authStore.model.id);
                
                // Redirect to the home page or dashboard after successful login
                goto('/');
            } else {
                console.log('Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    async function handleSubmit() {
        try {
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
                goto('/');
            }
        } catch (err) {
            error = err.message;
        }
    }

    function toggleMode() {
        isSignUp = !isSignUp;
        error = '';
    }
</script>

<h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>

<form on:submit|preventDefault={handleSubmit}>
    <input type="email" bind:value={email} placeholder="Email" required>
    <input type="password" bind:value={password} placeholder="Password" required>
    {#if isSignUp}
        <input type="password" bind:value={passwordConfirm} placeholder="Confirm Password" required>
    {/if}
    <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
</form>

<button on:click={toggleMode}>
    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
</button>

<button on:click={loginWithGoogle}>Login with Google</button>

{#if error}
    <p class="error">{error}</p>
{/if}

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }

    input, button {
        padding: 10px;
        font-size: 16px;
    }

    button {
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #357AE8;
    }

    .error {
        color: red;
        margin-top: 10px;
    }
</style>