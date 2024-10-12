<script>
	import { onMount, createEventDispatcher } from 'svelte'
    import { ChevronRight, ChevronLeft } from 'lucide-svelte';
	
	export let perPage = 1
	export let loop = true
	export let autoplay = 0
	export let startIndex = 0
	export let dots = true	
	export let controls = true

	let currentIndex = startIndex;
	let siema
	let totalSlides
	let timer
	const dispatch = createEventDispatcher()
	
	$: currentPerPage = perPage
	$: totalDots = totalSlides ? Math.ceil(totalSlides / currentPerPage) : 0
	
	onMount(() => {
		totalSlides = siema.children.length
		setupCarousel()
		
		if(autoplay) {
			timer = setInterval(right, autoplay);
		}
		return () => {
			autoplay && clearInterval(timer)
		}
	})
	
	function setupCarousel() {
		const slideWidth = 100 / currentPerPage
		Array.from(siema.children).forEach(slide => {
			slide.style.flex = `0 0 ${slideWidth}%`
		})
		go(startIndex)
	}
	
	function isDotActive(currentIndex, dotIndex) {
        if (currentIndex < 0) currentIndex = totalSlides + currentIndex;
        return currentIndex >= dotIndex*currentPerPage && currentIndex < (dotIndex*currentPerPage)+currentPerPage
    }
	
	function left() {
		go(currentIndex - currentPerPage)
	}
	
	function right() {
		go(currentIndex + currentPerPage)
	}
	
	function go(index) {
		if (loop) {
			index = (index + totalSlides) % totalSlides
		} else {
			index = Math.max(0, Math.min(index, totalSlides - currentPerPage))
		}
		currentIndex = index
		siema.style.transform = `translateX(-${index * (100 / currentPerPage)}%)`
		dispatch('change', {
			currentSlide: currentIndex,
			slideCount: totalSlides
		})
	}
	
	function pause() {
		clearInterval(timer);
	}
	
	function resume() {
		if (autoplay) {
			timer = setInterval(right, autoplay);
		}
	}
	
	function resetInterval(node, condition) {
		function handleReset(event) {
			pause();
			resume();
		}
		
		if(condition) {
			node.addEventListener('click', handleReset);
		}
		
		return {
		  destroy() {
			  node.removeEventListener('click', handleReset);
		  }
	  }
  }
</script>

<div class="carousel">
	<div class="slides" bind:this={siema}>
		<slot></slot>
	</div>
	{#if controls}
	    <button class="left" on:click={left} use:resetInterval={autoplay} aria-label="left">
          <ChevronLeft />
	  </button>
	  <button class="right" on:click={right} use:resetInterval={autoplay} aria-label="right">
          <ChevronRight />
	  </button>
	{/if}
    {#if dots}
	<ul>
		{#each Array(totalDots) as _, i}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<li on:click={() => go(i*currentPerPage)} class={isDotActive(currentIndex, i) ? "active" : ""}></li>
		{/each}
	</ul>
    {/if}
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
		overflow: hidden;
	}
	
	.slides {
		display: flex;
		transition: transform 0.3s ease-in-out;
	}
	
	button {
		position: absolute;
		width: 40px;
		height: 40px;
		top: 50%;
		z-index: 50;
		margin-top: -20px;
	}
	button:focus {
		outline: none;
	}
	
	.left {
		left: 10px;
	}
	
	.right {
		right: 10px;
	}
	ul {
		list-style-type: none;
		position: absolute;
		display: flex;
		justify-content: center;
		width: 100%;
		bottom: 10px;
		padding: 0;
		margin: 0;
	}
	ul li {
		margin: 0 6px;
		border-radius: 100%;
		background-color: rgba(255,255,255,0.5);
		height: 8px;
		width: 8px;
		cursor: pointer;
	}
	ul li:hover {
		background-color: rgba(255,255,255,0.85);
	}
	ul li.active {
		background-color: rgba(255,255,255,1);
	}
</style>