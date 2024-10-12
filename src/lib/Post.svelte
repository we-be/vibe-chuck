<script>
    import Carousel from '$lib/Carousel.svelte';
    import { Hash, Heart } from 'lucide-svelte';

    export let post;
    let liked = false;

    function toggleLike() {
        liked = !liked;
        // TODO do
    }
</script>

<div class="card card-hover m-4">
    <div class="card-content">
        <Carousel perPage={1} autoplay={5000}>
            {#each post.imgs as imgSrc (imgSrc)}
                <div class="carousel-slide">
                    <img src={imgSrc} alt={post.title} />
                </div>
            {/each}
            <div slot="left-control">←</div>
            <div slot="right-control">→</div>
        </Carousel>
        <div class="text-overlay">
            <div class="title-container">
                <h2>{post.title}</h2>
                {#if post.rank}
                    <span class="badge-icon variant-filled-primary">
                        <Hash size={9} />
                        <span>{post.rank}</span>
                    </span>
                {/if}
            </div>
            <p class="op"><i><sub>@{post.op}</sub></i></p>
            {#if post.description}
                <p class="event">{post.description}</p>
            {/if}
        </div>
        <button class="heart-button" on:click={toggleLike} aria-label="Like">
            <Heart fill={liked ? 'currentColor' : 'none'} />
        </button>
    </div>
</div>

<style>
    .card {
        border-radius: 1rem;
        overflow: hidden;
    }

    .card-content {
        position: relative;
        overflow: hidden;
        border-radius: 1rem;
    }

    .carousel-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .text-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(to top, 
            rgba(0,0,0,0.8) 0%, 
            rgba(0,0,0,0.7) 20%,
            rgba(0,0,0,0.6) 40%,
            rgba(0,0,0,0.4) 60%,
            rgba(0,0,0,0.2) 80%,
            rgba(0,0,0,0) 100%);
        color: white;
    }

    .title-container {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    h2 {
        margin: 0;
        margin-right: 10px;
        font-size: 1.5rem;
    }

    .op {
        margin-bottom: 5px;
    }

    .event {
        font-size: 0.9rem;
    }

    .heart-button {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.3s ease;
    }

    .heart-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .heart-button :global(svg) {
        width: 24px;
        height: 24px;
    }
</style>