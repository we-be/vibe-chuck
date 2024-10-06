<script>
	import Carousel from '$lib/Carousel.svelte';
	import { page } from '$app/stores';
	import { Hash } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	
	// Access the posts and pagination data from the page store
	$: ({ posts, pagination } = $page.data);

	// Function to handle page changes
	function changePage(newPage) {
		goto(`?page=${newPage}&perPage=${pagination.perPage}`);
	}
</script>

<div class="posts-container">
	{#each posts as post (post.id)}
		<div class="post">
			<div class="title-container">
				<h2>{post.title}</h2>
				{#if post.rank}
					<span class="badge-icon variant-filled-primary">
						<Hash size={9} />
						<span>{post.rank}</span>
					</span>
				{/if}
			</div>
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
            <p><i><sub>@{post.op}</sub></i></p>
			{#if post.description}
				<p class="event">{post.description}</p>
			{/if}
		</div>
	{/each}
</div>

<!-- Pagination controls -->
<div class="pagination">
	<button on:click={() => changePage(pagination.page - 1)} disabled={pagination.page === 1}>
		Previous
	</button>
	<span>Page {pagination.page} of {pagination.totalPages}</span>
	<button on:click={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
		Next
	</button>
</div>

<style>
	.posts-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.post {
		margin-bottom: 40px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.title-container {
		display: flex;
		align-items: center;
		padding: 15px;
	}

	h2 {
		margin: 0;
		margin-right: 10px;
	}

	.carousel-container {
		width: 100%;
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

	p {
		padding: 10px 15px;
		margin: 0;
	}

    .pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;
	}

	.pagination button {
		margin: 0 10px;
		padding: 5px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.pagination button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

</style>