<script lang="ts">
    import SEO from "$lib/components/marketing/SEO.svelte";
    import Markdown from "$lib/components/Markdown.svelte";
    import MarkdownIt from 'markdown-it';
    import sanitizeHtml from 'sanitize-html';
    import Fluid from "$lib/components/Fluid.svelte";
    import {PopupService} from "$lib/services/popup.service.svelte";
    import {WalletService, walletStore} from "$lib/services/wallet.service.svelte";
    import {getExplorerUrl, getReadableRequested} from "$lib";
    import {NotificationService} from "$lib/services/notification.service.svelte";
    import {goto} from "$app/navigation";
    import {contractStore} from "$lib/services/contract.service.svelte.js";
    import highlightjs from 'markdown-it-highlightjs';
    import 'highlight.js/styles/stackoverflow-dark.css';
    import Comments from "$lib/components/Comments.svelte";

    const {data} = $props();
    const proposal = $state(data.proposal);
    const signers = $state(data.signers);
    const signedProducers = ['producer1', 'producer2', 'producer3'];

    const md = new MarkdownIt({
        html: false,
    }).use(highlightjs);
    const html = $derived.by(() => md.render(proposal.markdown));
    const sanitized = $derived.by(() => sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img', 'span', 'pre', 'code', 'div'
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,

            // Allow Prism language classes
            code: ['class'],
            pre: ['class'],

            // Allow mermaid <div class="mermaid"> block output
            div: ['class'],
            span: ['class'],
        },
    }));

    let copied = $state(false);
    const share = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 1000);
        }).catch((err) => {
            console.error('Failed to copy: ', err);
        });
    }

    const burn = async () => {
        if(!walletStore.account) return NotificationService.connectWallet();
        PopupService.burn(async (amount, token) => {
            const result = await WalletService.burn(proposal.id, amount, token);
            if(result) {
                proposal.burned = parseFloat(parseFloat(proposal.burned + parseFloat(amount)).toFixed(4));
            }
        });
    }

    const goTo = (position:'top'|'bottom') => {
        if(position === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

    const cancel = async () => {
        if(!walletStore.account) return NotificationService.connectWallet();
        PopupService.cancel(async approved => {
            if(approved){
                const result = await WalletService.cancel(proposal.id, proposal.msig);
                if(result) {
                    NotificationService.addNotification('Proposal cancelled successfully', 'success');
                    await new Promise(r => setTimeout(r, 500));
                    await goto('/');
                }
            }
        })
    }

    const isProposer = $derived.by(() => {
        return walletStore.account === proposal.proposer;
    });

    const isBlockProducer = $derived.by(() => {
        return contractStore.producers.includes(walletStore.account);
    });

    const signProposal = async () => {
        if(!walletStore.account) return NotificationService.connectWallet();
        if(!isBlockProducer) {
            NotificationService.addNotification('Please connect your wallet to sign the proposal', 'error');
            return;
        }

        const result = await WalletService.signProposal(proposal.msig);
        if(result) {
            NotificationService.addNotification('Proposal signed successfully', 'success');
        }
    }


</script>

<SEO
    title={`- ${proposal.title}`}
    url={`https://build-fund.com/proposal/${proposal.id}`}
    description={proposal.summary}
/>

<!-- fixed top/bottom buttons -->
<section class="fixed right-6 bottom-20 flex flex-col gap-1 z-20 max-lg:right-2 max-lg:bottom-2">
    <button onclick={() => goTo('top')} class="btn-animate cursor-pointer bg-black text-white px-4 py-3 rounded-lg font-bold max-lg:px-3 max-lg:py-2">
        ↑
    </button>
    <button onclick={() => goTo('bottom')} class="btn-animate cursor-pointer bg-black text-white px-4 py-3 rounded-lg font-bold max-lg:px-3 max-lg:py-2">
        ↓
    </button>
</section>

<section class="relative px-30 max-lg:px-6 pt-20 bg-black pb-40">
    <section class="w-full absolute top-0 bottom-0 left-0 right-0 max-lg:fixed ">
        <figure class="max-lg:hidden fade-to-black"></figure>
        <Fluid forcedConfig={{
                    DENSITY_DISSIPATION: Math.random() * 4 + 2,
                    VELOCITY_DISSIPATION: Math.random() * 4 + 1,
                    PRESSURE: Math.random() * 0.8 + 0.05,
                    PRESSURE_ITERATIONS: Math.random() * 50 + 0.5,
                    CURL: Math.random() * 30 + 0.01,
                    SPLAT_RADIUS: Math.random() * 0.9 + 0.05,
                    SPLAT_FORCE: Math.random() * 50000 + 1,
                    COLOR_UPDATE_SPEED: Math.random() * 10 + 1,
                }} />
    </section>
    <section class="pt-30 max-lg:pt-10 relative w-full flex justify-center items-center flex-col max-w-3xl mx-auto text-center text-white">
        <figure class="flex max-lg:flex-col items-center gap-2 max-lg:gap-1 text-xs text-white/50 max-w-xl">
            <span class="text-white">{proposal.proposer}</span>
            <span class="max-lg:hidden">•</span>
            <a href={`${getExplorerUrl()}/msig/${proposal.proposer}/${proposal.msig}`} target="_blank" class="truncate block underline hover:text-white" rel="noopener noreferrer">
                msig:{proposal.msig}
            </a>
            <span class="max-lg:hidden">•</span>
            <span>{new Date(proposal.date).toDateString()}</span>
        </figure>
        <h1 class="text-7xl serif max-lg:text-3xl mt-4">
            {proposal.title}
        </h1>

        <figure class="text-md mt-10 max-w-2xl max-lg:text-sm max-lg:mt-4">
            {proposal.summary}
        </figure>


        <section class="flex gap-2 text-lg max-lg:flex-col max-lg:gap-1 mt-10">
            <button onclick={burn} class="btn-animate cursor-pointer bg-blue-500 text-white  px-6 py-3  rounded-lg max-lg:text-lg">
                <span class="text-xl flame">🔥</span>
                <span><b>{proposal.burned}</b> Burned</span>
            </button>
            <a href="#read" class="cursor-pointer text-white px-6 py-3  rounded-lg font-bold max-lg:text-lg group">
                <span class="group-hover:underline">Read Proposal</span> ↓
            </a>
        </section>

    </section>

</section>

<!-- action bar: progress, share -->
<section class="-mt-14 relative">
    <div class="max-w-7xl mx-auto px-6">
        <div class="bg-white shadow-lg rounded-xl p-6 flex justify-between min-lg:items-center max-lg:flex-col max-lg:gap-4 relative overflow-hidden">
            <section class="w-[50%] flex justify-between min-lg:pr-6 max-lg:flex-col max-lg:items-start">
                <div class="flex flex-col">
                    <span class="text-sm text-black/70">Requested</span>
                    <span class="text-2xl font-bold text-black">{getReadableRequested(proposal.requested)}</span>
                </div>

                <div class="flex flex-col min-lg:text-right relative max-lg:mt-5">
                    <span class="text-sm text-black/70">Votes</span>
                    <span class="text-2xl font-bold">
                            {proposal.approvals}<span class="text-black/30">/21</span>
                        </span>
                </div>
            </section>

            <figure class="absolute min-lg:left-[50%] right-0 top-0 bottom-0  bg-black/3"></figure>

            <section class="flex items-end gap-2 relative max-lg:mt-5 max-lg:flex-col">

                {#if isProposer}
                    <button onclick={cancel} class="btn-animate cursor-pointer bg-red-500 text-white px-6 py-3 rounded-lg font-bold max-lg:text-lg max-lg:w-full">
                        <span class="group-hover:underline">Cancel</span>
                    </button>
                {/if}

                <button onclick={share} class="btn-animate cursor-pointer bg-black text-white px-6 py-3 rounded-lg font-bold max-lg:text-lg max-lg:w-full">
                        <span class="group-hover:underline">
                            {#if copied}
                                Copied Link!
                            {:else}
                                Share
                            {/if}
                        </span>
                </button>
            </section>

        </div>
    </div>
</section>

<article id="read" class="flex flex-grow flex-col mx-auto mt-10 relative px-6">
    <section class="max-w-5xl mx-auto w-full overflow-hidden">
        <div class="relative">
            <div class="all-prose mb-10 mt-20">
                <Markdown>
                    {@html sanitized}
                </Markdown>
            </div>
        </div>
        <!-- signature SVG and button to sign -->
        <section class="flex flex-col items-end max-lg:items-center mt-20 mb-40">
            <section class="flex gap-10 items-center max-lg:flex-col">
                <img src="/images/bp-sig.png" alt="Signature" class="w-32" />

                <button disabled={!isBlockProducer} onclick={signProposal} class="{!isBlockProducer && 'disabled'}
                min-lg:-ml-10 max-lg:-mt-10 cursor-pointer btn-animate relative bg-black text-white px-6 py-3 rounded-lg font-bold max-lg:text-lg">
                    Sign Proposal
                </button>
            </section>
        </section>

        <!-- a list of names of producers that have already signed -->
        <section class="mb-40">
            <p class="text-sm text-black/80 border-b border-black/40 pb-1">Signed</p>
            {#if signers.length}
                <section class="flex gap-1 mt-2">
                    {#each signers as producer}
                        <!-- thumbs up -->
                        <span class="text-xs py-1 font-medium italic border-1 border-black/10 text-black px-2 rounded">
                            <span class="mr-2">👍</span>
                            {producer}
                        </span>
                    {/each}
                </section>
            {:else}
                <p class="text-sm text-black/60 italic mt-2">No signatures yet.</p>
            {/if}
        </section>

    </section>
</article>

<figure class="h-[1px] w-full bg-black/10 -mt-20"></figure>

<section class="max-w-5xl mx-auto w-full">

    <section class="mt-20">
        <Comments {proposal} />
    </section>

    <figure class="h-20"></figure>
</section>




