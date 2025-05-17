<script setup lang="ts">
	import { onMounted, onUnmounted, ref } from 'vue';

	const isVisible = ref(false);
	const scrollThreshold = 300; // Show button after scrolling 300px

	const checkScroll = () => {
		isVisible.value = window.scrollY > scrollThreshold;
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	onMounted(() => {
		window.addEventListener('scroll', checkScroll);
	});

	onUnmounted(() => {
		window.removeEventListener('scroll', checkScroll);
	});
</script>

<template>
	<button
		v-if="isVisible"
		class="fixed bottom-20 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:accent-offset-2"
		aria-label="Scroll to top"
		@click="scrollToTop"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-5 w-5"
		>
			<path d="m18 15-6-6-6 6" />
		</svg>
	</button>
</template>
