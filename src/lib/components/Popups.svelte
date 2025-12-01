<script lang="ts">
    import PopupBurn from "$lib/components/popups/PopupBurn.svelte";
    import {PopupService, PopupType} from "$lib/services/popup.service.svelte";
    import PopupCancel from "$lib/components/popups/PopupCancel.svelte";
    import PopupProposing from "$lib/components/popups/PopupProposing.svelte";

    const openPopup = $derived.by(() => {
        return PopupService.getPopups()[0] || null;
    })
</script>


<section class="popups">

    {#if openPopup}
        <button aria-label="popup-bg" onclick={() => openPopup.data.cantClose ? null : openPopup.close()} class="popups-bg"></button>
        {#if openPopup.type === PopupType.Burn}
            <PopupBurn popup={openPopup} />
        {/if}
        {#if openPopup.type === PopupType.Cancel}
            <PopupCancel popup={openPopup} />
        {/if}
        {#if openPopup.type === PopupType.Proposing}
            <PopupProposing popup={openPopup} />
        {/if}
    {/if}
</section>

<style lang="scss">

    .popups {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        display:flex;
        align-items: center;
        justify-content: center;


        .popups-bg {
            cursor: pointer;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            animation: fadeIn 0.2s ease-in-out;
            pointer-events: auto;
            z-index:-1;
            backdrop-filter: blur(8px);
        }
    }
</style>


