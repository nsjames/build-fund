<script lang="ts">
    import {NotificationService, notificationStore} from "$lib/services/notification.service.svelte";

    const notificationColors = (notification:any) => {
        if (notification.type === 'error') {
            return 'text-white bg-red-500 hover:bg-red-500/70';
        } else if (notification.type === 'success') {
            return 'bg-green-800 text-white hover:bg-green-800/70';
        } else {
            return 'bg-yellow-500 text-black hover:bg-yellow-500/70';
        }
    }
</script>

<section class="fixed bottom-0 right-0 left-0 items-center p-4 flex flex-col gap-2 pointer-events-none" style="z-index: 2000;">
    {#each notificationStore.notifications as notification}
        <button onclick={() => NotificationService.removeNotification(notification.id)} class="relative block pointer-events-auto slide-in wiggle text-md px-3 py-1 rounded  shadow-sm
         transition-colors duration-100 cursor-pointer {notificationColors(notification)}">
            {notification.message}
        </button>
    {/each}
</section>