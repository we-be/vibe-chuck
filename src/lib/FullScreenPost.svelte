<script>
    import Carousel from '$lib/Carousel.svelte';
    import { Hash, Heart, X } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let post;
    let liked = false;
    let votes = post.votes || 0;

    function toggleLike() {
        liked = !liked;
        votes += liked ? 1 : -1;
        // TODO hit api
    }

    function formatVotes(count) {
        if (count < 1000) return count.toString();
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith('.0') 
            ? formatted.slice(0, -2) + 'K' 
            : formatted + 'K';
    }

    function close() {
        dispatch('close');
    }
</script>

<div class="full-screen-post">
    <button class="close-button" on:click={close} aria-label="Close">
        <X />
    </button>
    <div class="content">
        <Carousel perPage={1} autoplay={0} controls={true}>
            {#each post.imgs as imgSrc (imgSrc)}
                <div class="carousel-slide">
                    <img src={imgSrc} alt={post.title} />
                </div>
            {/each}
        </Carousel>
        <div class="info">
            <h2>{post.title}</h2>
            {#if post.rank}
                <span class="badge-icon variant-filled-primary">
                    <Hash size={9} />
                    <span>{post.rank}</span>
                </span>
            {/if}
            <p class="op"><i>@{post.op}</i></p>
            {#if post.description}
                <p class="description">{post.description}</p>
            {/if}
            <div class="heart-container">
                <button class="icon-button heart-button" on:click={toggleLike} aria-label="Like">
                    <Heart fill={liked ? 'currentColor' : 'none'} />
                </button>
                <p class="votes">{formatVotes(votes)}</p>
            </div>
        </div>
    </div>
</div>

<style>
    .full-screen-post {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }

    .content {
        width: 90%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .carousel-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 70vh;
    }

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .info {
        color: white;
        text-align: center;
        margin-top: 20px;
    }

    h2 {
        margin: 0;
        font-size: 24px;
    }

    .op, .description {
        margin: 10px 0;
    }

    .heart-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon-button {
        background: none;
        border: none;
        cursor: pointer;
        color: white;
    }

    .votes {
        margin-left: 10px;
    }
</style>