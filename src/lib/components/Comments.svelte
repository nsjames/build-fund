<script lang="ts">
    import {getExplorerUrl, timeAgo} from "$lib";
    import { blo } from "blo";
    import {WalletService, walletStore} from "$lib/services/wallet.service.svelte";
    import {NotificationService} from "$lib/services/notification.service.svelte";
    import {PopupService} from "$lib/services/popup.service.svelte";
    import {onMount} from "svelte";
    import {ContractService} from "$lib/services/contract.service.svelte";
    import type {Comment} from "$lib/models/comment.model";

    const {proposal} = $props();

    let comments:Comment[] = $state([]);
    let newComment = $state('');

    onMount(async () => {
        comments = await ContractService.getComments(proposal.id);
    });

    const comment = async () => {
        if(!walletStore.account) return NotificationService.connectWallet();
        if (newComment.trim() === '') return NotificationService.addNotification('Comment cannot be empty.', 'error');

        PopupService.burn(async (amount, token) => {
            const commentId = await WalletService.burn(proposal.id, amount, token, newComment);
            if(commentId !== null) {
                proposal.burned = parseFloat(parseFloat(proposal.burned + parseFloat(amount)).toFixed(4));
                comments.push(<Comment>{
                    id: commentId,
                    account: walletStore.account!,
                    message: newComment,
                    burned: parseFloat(amount),
                    date: new Date()
                });
                newComment = '';
            }
        });
    }
</script>

<section class="max-w-7xl mx-auto px-6 relative">
    <p class="text-sm text-black/80 border-b border-black/40 pb-1">Join the discussion.</p>
    <div class="overflow-y-auto mt-10">
        {#each comments as comment}
            <section class="pb-2 border-b border-black/10 not-first:mt-10">
                <section class="font-bold flex max-lg:flex-col max-lg:items-start items-center justify-between">
                    <a href={`${getExplorerUrl()}/account/${comment.account}`} target="_blank" rel="noopener noreferrer"  class="flex gap-2 items-center group">
                        <img class="w-6 rounded-full" alt={comment.account} src={blo(`0x${comment.account}0000`)} />
                        <span class="group-hover:underline">
                            {comment.account}
                        </span>
                    </a>
                    <section class="flex gap-2 max-lg:mt-1">
                        <span class="text-xs font-medium text-gray-500">🔥 {comment.burned.toFixed(4)}</span>
                        <span class="text-xs font-medium text-gray-500">{timeAgo(comment.date)}</span>
                    </section>

                </section>
                <p class="text-md mt-2 max-lg:mt-4">{comment.message}</p>
            </section>
        {/each}
    </div>
    <section class="mt-10">
        <textarea bind:value={newComment} class="w-full p-3 border border-black/30 rounded mb-2" rows="3" placeholder="Add a comment..."></textarea>
        <button onclick={comment} type="submit" class="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
    </section>
</section>
