<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import {page} from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import Notifications from "$lib/components/Notifications.svelte";
	import {WalletService, walletStore} from "$lib/services/wallet.service.svelte";
	import Popups from "$lib/components/Popups.svelte";
	import {onMount} from "svelte";
	import {ContractService} from "$lib/services/contract.service.svelte";

	let { children } = $props();

	const title = "Build Fund - Get projects funded on the EOS/Vaulta blockchain";
	const description = "A platform to submit and fund proposals for projects building on the EOS/Vaulta blockchain. Empowering developers and innovators to bring their ideas to life with network support.";
	const keywords = "";
	const image = "https://build-fund.com/meta.png";

	const links = [
		{ name: 'Proposals', url: '/' },
		{ name: 'Propose', url: '/propose' },
	]

	const isDarkHero = true;// $derived.by(() => page.url.pathname === '/' || page.url.pathname.startsWith('/blog'));
	const activeRoute = $derived.by(() => page.url.pathname);

	let showingMobileMenu = $state(false);

	onMount(() => {
		WalletService.init();
		ContractService.getProducers();
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<!-- meta data information -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="author" content="nsjames" />
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={image} />


</svelte:head>

<Notifications />
<Popups />

<nav class="flex justify-between items-center gap-10 absolute top-0 left-0 right-0 py-5 px-5 {isDarkHero ? 'nav-fade-black' : 'nav-fade-white'}" style="z-index:10;">
	<section class="px-2 {isDarkHero ? 'border-white text-white' : ' border-black text-black'} border-4 rounded-lg">
		<a href="/">
			<figure class="text-lg font-black">BUILD</figure>
		</a>
	</section>
	<section class="max-lg:hidden flex gap-20 {isDarkHero ? 'text-white' : 'text-black'}">
		{#each links as link}
			<a href="{link.url}" class="cursor-pointer font-bold text-sm hover:underline underline-offset-4 {activeRoute === link.url ? (isDarkHero ? 'text-white underline' : 'text-black underline') : (isDarkHero ? 'text-white/70' : 'text-black/70')}">
				{link.name}
			</a>
		{/each}
	</section>

	<section>
		<section class=" max-lg:hidden">
			{#if !walletStore.account}
				<button onclick={WalletService.login} class="btn-animate cursor-pointer font-bold text-sm px-4 py-2 rounded-lg {isDarkHero ? 'bg-white text-black' : 'bg-black text-white'}">
					Connect
				</button>
			{:else}
				<!-- show account info and logout button -->
				<section class="flex items-center gap-4">
					<figure class="text-white font-bold text-sm">
						@{walletStore.account}
					</figure>
					<button onclick={WalletService.logout} class="btn-animate cursor-pointer font-bold text-sm px-4 pr-1 py-2 rounded-lg {isDarkHero ? 'bg-white text-black' : 'bg-black text-white'}">
						<!-- logout svg -->
						<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
				</section>
			{/if}
		</section>

		<!-- hamburger menu for mobile -->
		<section class="lg:hidden inline-block ml-4">
			<button class="cursor-pointer" onclick={() => showingMobileMenu = true} aria-label="Open Menu">
				<span class="block w-6 h-0.5 mb-1 {isDarkHero ? 'bg-white' : 'bg-black'}"></span>
				<span class="block w-6 h-0.5 mb-1 {isDarkHero ? 'bg-white' : 'bg-black'}"></span>
				<span class="block w-6 h-0.5 {isDarkHero ? 'bg-white' : 'bg-black'}"></span>
			</button>
			<section class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm {showingMobileMenu ? '' : 'hidden'}">
				<section class="fixed top-0 left-0 right-0 bottom-0 bg-black">
					<!-- close button -->
					<section class="flex items-end w-full bg-white/3 justify-end">
						<button onclick={() => showingMobileMenu = false} class="flex justify-end px-5 py-7.5 cursor-pointer" aria-label="Close Menu">
						<span class="inline">
							<span class="block w-6 h-0.5 mb-1 bg-white rotate-45 translate-y-1.5"></span>
							<span class="block w-6 h-0.5 bg-white -rotate-45"></span>
						</span>
						</button>
					</section>
					<section class="flex flex-col gap-10 p-10">
						{#each links as link}
							<a onclick={() => showingMobileMenu = false} href="{link.url}" class="cursor-pointer font-bold text-lg text-white hover:underline underline-offset-4">
								{link.name}
							</a>
						{/each}

						<section>
							{#if !walletStore.account}
								<button onclick={WalletService.login} class="btn-animate cursor-pointer font-bold text-sm px-4 py-2 rounded-lg {isDarkHero ? 'bg-white text-black' : 'bg-black text-white'}">
									Connect
								</button>
							{:else}
								<!-- show account info and logout button -->
								<section class="flex items-center gap-4">
									<figure class="text-white font-bold text-sm">
										@{walletStore.account}
									</figure>
									<button onclick={WalletService.logout} class="btn-animate cursor-pointer font-bold text-sm px-4 pr-1 py-2 rounded-lg {isDarkHero ? 'bg-white text-black' : 'bg-black text-white'}">
										<!-- logout svg -->
										<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
									</button>
								</section>
							{/if}
						</section>
					</section>
				</section>
			</section>
		</section>
	</section>
</nav>

{@render children()}

<Footer />

<style lang="scss">
	.nav-fade-white {
		background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 10%),
		linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
	}

	.nav-fade-black {
		background: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 10%),
		linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
	}
</style>