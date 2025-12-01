<script lang="ts">

    const {
        popup
    } = $props();

    import {NotificationService} from "$lib/services/notification.service.svelte";

    const TOKENS = {
        EOS:'EOS',
        Vaulta:'A'
    };
    let token = $state(TOKENS.Vaulta);
    let amount = $state(1);

    const submit = () => {
        if(amount <= 0) {
            NotificationService.addNotification('Please enter a valid amount', 'error');
            return;
        }
        popup.data.submit({
            token,
            amount
        });
    }
</script>

<section class="popup w-[calc(100%-10px)] max-w-sm">
    <figure class="text-lg text-white font-bold">
        Burn Tokens
    </figure>
    <figure class="text-xs text-white/60 mt-1">
        Burn your tokens to show support for the project. This action is irreversible.
    </figure>

    <section class="flex gap-2 border border-white/10 rounded-lg p-1 mt-6">
        <input bind:value={amount} class="w-full text-lg font-bold text-white outline-0 ring-0 px-2" />
        <section class="w-[90px]" style="flex: 0 0 auto;">
            <select bind:value={token}
                    class="w-full p-2 bg-neutral-900 border border-zinc-700 rounded text-zinc-200
                               focus:ring-0 focus:border-zinc-500 outline-none font-black">
                <option value={TOKENS.Vaulta}>A</option>
                <option value={TOKENS.EOS}>EOS</option>
            </select>
        </section>
    </section>

    <!-- 1, 10, 100 buttons -->
    <section class="flex max-w-4xl gap-2 mt-2">
        {#each [1,10,100] as preset}
            <button onclick={() => amount = preset} class="cursor-pointer px-2 py-2 font-bold flex-1 bg-white/1 border border-white/2 btn-animate text-white
            rounded text-xs hover:bg-white/20 {amount === preset ? 'bg-white/8 border-white/20' : ''}">
                {preset}
            </button>
        {/each}
    </section>

    <button onclick={submit} class="mt-6 btn-animate cursor-pointer text-lg px-4 py-2 rounded-lg bg-red-600 text-white w-full hover:bg-red-700">
        <span class="text-xl flame">🔥</span> Burn <b>{amount} {token}</b>
    </button>

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