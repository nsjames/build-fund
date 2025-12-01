<script lang="ts">

    const {
        popup
    } = $props();
</script>

<section class="popup w-[calc(100%-10px)] max-w-sm">
    <figure class="text-lg text-white font-bold">
        Cancel Proposal
    </figure>
    <figure class="text-xs text-white mt-3">
        Are you sure you want to cancel this proposal?
        <br />
        <b class="text-red-500 underline italic">This action is irreversible.</b>
    </figure>

    <section class="flex gap-2 text-md font-bold mt-5">
        <button onclick={() => popup.close()} class="mt-6 btn-animate cursor-pointer  px-4 py-2 rounded-lg bg-white/5 text-white w-full hover:bg-white/10">
            Nevermind
        </button>
        <button onclick={() => popup.data.submit(true)} class="mt-6 btn-animate cursor-pointer  px-4 py-2 rounded-lg bg-red-600 text-white w-full hover:bg-red-700">
            Confirm
        </button>
    </section>

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