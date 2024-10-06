<script>
    import { pbStore } from '$lib/pocketbase';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let pb;

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
</script>

<h1>Login with Google</h1>
<button on:click={loginWithGoogle}>Login with Google</button>

<style>
    h1 {
        font-size: 24px;
        margin-bottom: 20px;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #4285F4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #357AE8;
    }
</style>