<script lang="ts">

    import Spinner from "$lib/components/Spinner.svelte";

    const {
        popup
    } = $props();

    import {NotificationService} from "$lib/services/notification.service.svelte";
    import {globalStore, STATUS} from "$lib/store/global.store.svelte";

    const canClose = $derived.by(() => {
        return globalStore.proposingSteps.steps.every(x => x.status === STATUS.Success || x.status === STATUS.Failed);
    })

    const close = () => {
        popup.data.submit();
    }

</script>

<section class="popup w-[calc(100%-10px)] max-w-sm">
    <figure class="text-lg text-white font-bold">
        Publishing Proposal
    </figure>
    <figure class="text-xs text-white/60 mt-1">
        Please read and sign the transactions in your wallet to complete the proposal.
        <b class="text-red-500 underline italic">Do not close the browser in the middle!</b>
    </figure>

    <section class="border-white/10 border-1 mt-5 rounded overflow-hidden">
        {#each globalStore.proposingSteps.steps as step, index}
            <section class="flex bg-white/2 hover:bg-white/5 not-first:border-t-1 not-first:border-t-white/4">
                <figure class="w-2 h-11 transition-colors
                    {step.status === STATUS.Success && 'bg-blue-500/20'}
                    {step.status === STATUS.Failed && 'bg-red-500/20'}
                    {step.status === STATUS.Pending && 'bg-white/4'}
                    {step.status === STATUS.Working && 'bg-white/20'}
                "></figure>
                <section class="p-3 flex items-center">

                    <figure class="text-white">
                        {#if step.status === STATUS.Working}
                            <Spinner class="w-4 fill-white/30" />
                        {:else if step.status === STATUS.Success}
                            <svg class="w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {:else if step.status === STATUS.Failed}
                            <svg class="w-5 animate-bounce text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {:else if step.status === STATUS.Pending}
                            <figure class="w-5"></figure>
                        {/if}
                    </figure>

                    <figure class="ml-3  {step.status === STATUS.Pending ? 'text-white/20' : 'text-white'} {step.status === STATUS.Failed && 'text-red-500!'} text-sm font-bold">
                        {step.text}
                    </figure>
                </section>
            </section>
        {/each}
    </section>

    {#if canClose}
        <button onclick={close} class="cursor-pointer btn-animate bg-black text-white px-6 py-3 rounded-lg font-bold mt-6 w-full group">
            <span class="">Close</span>
        </button>
    {/if}

</section>

<style lang="scss">

    select {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }

    select option {
        background-color: rgba(0, 0, 0, 1);
        color: white;
    }

    select option:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>