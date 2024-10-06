<script>
	import Carousel from '$lib/Carousel.svelte';
	import { page } from '$app/stores';
	
	// Access the posts data from the page store
	$: ({ posts } = $page.data);
</script>

<div class="posts-container">
	{#each posts as post (post.id)}
		<div class="post">
			<h2>{post.title}</h2>
			<div class="carousel-container">
				<Carousel perPage={1} autoplay={5000}>
					{#each post.imgs as imgSrc (imgSrc)}
						<div class="carousel-slide">
							<img src={imgSrc} alt={post.title} />
						</div>
					{/each}
					<div slot="left-control">←</div>
					<div slot="right-control">→</div>
				</Carousel>
			</div>
			{#if post.rank}
				<p class="rank">Rank: {post.rank}</p>
			{/if}
			{#if post.event}
				<p class="event">Event: {post.event}</p>
			{/if}
		</div>
	{/each}
</div>

<style>
	.posts-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.post {
		margin-bottom: 40px;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	h2 {
		padding: 15px;
		margin: 0;
		background-color: #f5f5f5;
		border-bottom: 1px solid #ddd;
	}

	.carousel-container {
		width: 100%;
	}

	.carousel-slide {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		aspect-ratio: 16 / 9; /* Maintain a 16:9 aspect ratio, adjust as needed */
		overflow: hidden;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover; /* This will cover the entire container */
	}

	p {
		padding: 10px 15px;
		margin: 0;
		border-top: 1px solid #ddd;
	}

	.rank {
		background-color: #e8f5e9;
	}

	.event {
		background-color: #e3f2fd;
	}
</style>