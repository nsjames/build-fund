import type { PageLoad } from './$types';
import {redirect} from "@sveltejs/kit";
import {ContractService} from "$lib/services/contract.service.svelte";

export const load: PageLoad = async ({ params }) => {
    if(!params.id){
        throw redirect(302, '/');
    }

    const proposal = await ContractService.getProposal(
        parseInt(params.id)
    );

    if(!proposal){
        throw redirect(302, '/');
    }

    const signers = await ContractService.getProposalSigners(
        proposal.proposer,
        proposal.msig
    );

    return {
        proposal,
        signers,
    };
};