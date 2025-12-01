<script lang="ts">

    import {onDestroy, onMount} from "svelte";
    import type {Proposal} from "$lib/models/proposal.model";
    import {commaSeparatedNumber, getReadableRequested} from "$lib";
    import {ContractService} from "$lib/services/contract.service.svelte";
    import {WalletService, walletStore} from "$lib/services/wallet.service.svelte";
    import {NotificationService} from "$lib/services/notification.service.svelte";
    import {PopupService} from "$lib/services/popup.service.svelte";
    import Spinner from "$lib/components/Spinner.svelte";


    const SORTS = {
        HIGHEST_AMOUNT: 'Amount Requested',
        MOST_BURNED: 'Most Burned',
        NEWEST: 'Newest',
    };

    let proposals:Proposal[] = $state([]);
    let page = $state(0);
    let loadMoreElement;
    let selectedSort = $state(SORTS.MOST_BURNED);
    let loadingMore = $state(false);
    let observer;
    let initialLoad = $state(true);

    const fetchProposals = async (blowAway = false) => {
        if(loadingMore) return;
        loadingMore = true;
        if (blowAway) {
            page = 0;
            proposals = [];
        } else {
            page++;
        }

        const newProposals = await ContractService.getProposals((() => {
            if(selectedSort === SORTS.HIGHEST_AMOUNT) return 0;
            if(selectedSort === SORTS.MOST_BURNED) return 1;
            if(selectedSort === SORTS.NEWEST) return 2;
            return 1;
        })(), page);
        proposals = [...proposals, ...newProposals];
        await new Promise(resolve => setTimeout(resolve, 500)); // artificial delay for better UX
        loadingMore = false;
        initialLoad = true;
    }

    onMount(async () => {
        await fetchProposals(true);

        observer = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    await fetchProposals();
                }
            }
        }, {
            root: null,
            rootMargin: '0px 0px 100px 0px',
            threshold: 0.1
        });

        observer.observe(loadMoreElement);
    })

    onDestroy(() => {
        if(observer) observer.disconnect();
    })


    const proposalPercentage = (proposal: Proposal) => {
        const percentage = Math.min((proposal.approvals / 21) * 100, 100);
        return `${percentage}%`;
    }

    const burn = async (proposal) => {
        if(!walletStore.account) return NotificationService.connectWallet();
        PopupService.burn(async (amount, token) => {
            const result = await WalletService.burn(proposal.id, amount, token);
            if(result) {
                proposal.burned = parseFloat(parseFloat(proposal.burned + parseFloat(amount)).toFixed(4));
            }
        });
    }

    const onSortChange = async () => {
        await fetchProposals(true);
    }


</script>

<section id="proposals" class="max-w-6xl mx-auto">
    <section class="flex flex-col gap-2 max-w-6xl mx-auto text-white py-10 px-6">

        {#if !proposals.length && !initialLoad}
            <section class="flex justify-center w-full mx-auto pb-30">
                <!-- dotted outline box -->
                <div class="border-2 border-dashed border-white/20 rounded-lg p-10 w-full max-w-md text-center">
                    <h2 class="text-2xl font-bold mb-4">No Proposals Found</h2>
                    <p class="text-white/60">There are currently no proposals available. Please check back later.</p>
                </div>
            </section>
        {:else}
            {#if proposals.length}
                <section class="flex justify-end w-full mx-auto">
                    <label class="text-sm text-white/70 flex items-center gap-2 max-lg:w-full">
                        <select onchange={onSortChange} bind:value={selectedSort} class="bg-black/30 border border-white/20 text-white rounded px-3 py-1 text-sm max-lg:w-full">
                            {#each Object.values(SORTS) as sortOption}
                                <option value={sortOption}>{sortOption}</option>
                            {/each}
                        </select>
                    </label>
                </section>
            {/if}


            <!-- Rows -->
            {#each proposals as proposal}
                <section class="relax-popup overflow-hidden group w-full mx-auto black-glass">
                    <section class="relative pointer-events-auto">
                        <section class="popup-hover-outline">
                            <figure class="color-rotate-1"></figure>

                            <div class="absolute inset-0 overflow-hidden pointer-events-none">

                                <div class="absolute -top-32 left-0 w-96 h-96
      bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500
      opacity-30 blur-[120px] rounded-full">
                                </div>

                                <div class="absolute top-10 -right-32 w-96 h-96
      bg-gradient-to-bl from-amber-300 via-rose-400 to-red-500
      opacity-25 blur-[140px] rounded-full">
                                </div>

                                <div class="absolute -bottom-20 left-20 w-80 h-80
      bg-gradient-to-tr from-teal-400 to-blue-500
      opacity-20 blur-[100px] rounded-full">
                                </div>

                            </div>
                        </section>

                        <div class="absolute inset-0 pointer-events-none opacity-10">
                            <div class="absolute -inset-20
      bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-teal-400 to-amber-300
      opacity-40 blur-3xl">
                            </div>
                        </div>

                        <section class=" rounded-lg p-6 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">

                            <!-- Left side -->
                            <section class="flex-1 space-y-3">
                                <!-- Header -->
                                <figure class="flex items-center gap-2 text-xs text-white/50 max-w-xl max-lg:flex-col max-lg:gap-1 max-lg:items-start max-lg:mb-8">
                                    <span class="text-white">{proposal.proposer}</span>
                                    <span class="max-lg:hidden">•</span>
                                    <span class="truncate block">
                                    msig-{proposal.msig}
                                </span>
                                </figure>
                                <!-- Title -->
                                <h2 class="text-2xl font-bold text-white">
                                    {proposal.title}
                                </h2>

                                <!-- Summary -->
                                <p class="text-white/60 text-sm leading-relaxed max-w-xl max-lg:text-xs">
                                    {proposal.summary}
                                </p>
                            </section>

                            <!-- Right side -->
                            <div class="flex flex-col items-end gap-1 shrink-0 min-w-[200px] max-lg:items-start max-lg:w-full">


                                <!-- Upvotes -->
                                <a href="/proposals/{proposal.id}" class="cursor-pointer text-sm text-center w-full px-4 py-4 rounded border-1 border-blue-600 hover:bg-blue-700 transition font-bold text-white">
                                    View Proposal
                                </a>

                                <!-- Upvotes -->
                                <button onclick={() => burn(proposal)} class="btn-animate border border-orange-500/10 text-sm cursor-pointer flex justify-center items-center gap-2 text-white rounded w-full px-5 py-3 transition">
                                    <span class="text-xl flame">🔥</span>
                                    <span><b>{proposal.burned}</b> Burned</span>
                                </button>
                            </div>
                        </section>


                        <!-- BP Votes -->
                        <div class="rounded px-6 pb-6">
                            <div class="flex max-lg:flex-col items-center max-lg:items-start justify-between text-lg mb-2 font-bold">
                            <span class="flex flex-col items-start">
                                <span>
                                    <span class="text-white">{getReadableRequested(proposal.requested)}</span>
                                </span>
                                <span class="text-white/20 text-xs -mt-1">Requested</span>
                            </span>
                                <span class="flex flex-col items-end max-lg:items-start max-lg:mt-5">
                                <span>
                                    <span class="text-white">{proposal.approvals}</span><span class="text-white/50">/21</span>
                                </span>
                                <span class="text-white/20 text-xs -mt-1">Network Votes</span>
                            </span>

                            </div>

                            <div class="w-full bg-white/2 border-1 border-white/3 group-hover:border-blue-500/30 group-hover:bg-black/1 transition-colors rounded-full h-2 overflow-hidden max-lg:mt-5">
                                <div class="bg-white/30 h-full group-hover:bg-blue-500/90 transition-colors" style="width: {proposalPercentage(proposal)};"></div>
                            </div>
                        </div>
                    </section>
                </section>


            {/each}

        {/if}
    </section>

    <figure bind:this={loadMoreElement}></figure>

    <section class="h-[40px]">
        {#if loadingMore}
            <section class="flex justify-center gap-4 items-center animate-pulse">
                <Spinner class="w-6 fill-white" />
                <figure class="text-sm text-white">Loading Proposals...</figure>
            </section>
        {/if}
    </section>

</section>

<style lang="scss">

    .popup-hover-outline {
        position: absolute;
        top:0; bottom:0; left:0; right:0;
        inset: 0;
        border-radius: 6px;
        overflow: hidden;

        /* Create rectangular cutout */
        -webkit-mask:
                linear-gradient(rgba(0,0,0,0.98) 0 0) content-box,
                linear-gradient(rgba(0,0,0,0.94) 0 0);
        -webkit-mask-composite: xor;

        mask:
                linear-gradient(rgba(0,0,0,0.98) 0 0) content-box,
                linear-gradient(rgba(0,0,0,0.94) 0 0);
        mask-composite: exclude;

        padding: 1px;
    }

    /* rotating gradient layer behind the mask */
    .color-rotate-1::after {
        content: "";
        position: absolute;
        inset: -152px; /* make it bigger so blur doesn't clip */
        border-radius: inherit;
        z-index: -2;

        animation: spin-rainbow 5.2s linear infinite;
        filter: blur(8px);
        opacity: 0;
        transition: opacity 0.8s ease;

        background: conic-gradient(
                        transparent,
                        transparent,
                        transparent,
                        yellow,
                        transparent,
                        transparent,
                        transparent,
                        transparent,
                        transparent,
                        transparent,
                        yellow,
                        transparent,
                        transparent,
                        transparent,
        );
    }


    .color-rotate-1:hover::after,
    .group:hover .color-rotate-1::after {
        opacity: 0.7;
        transition: opacity 0.25s ease;
    }

    @keyframes spin-rainbow {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }

    .relax-popup {
        border-radius: 8px;
        position: relative;
    }
</style>