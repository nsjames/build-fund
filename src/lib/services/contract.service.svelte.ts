import {Chains, APIClient, Name} from "@wharfkit/session"
import { ContractKit } from "@wharfkit/contract"
import {PUBLIC_CONTRACT} from "$env/static/public";
import type {Proposal} from "$lib/models/proposal.model";
import {NotificationService} from "$lib/services/notification.service.svelte";
import {getChain, unixDate} from "$lib";
import type {Comment} from "$lib/models/comment.model";

export class ContractStore {
    public producers:string[] = $state([])
}

export const contractStore = new ContractStore();

const chain = getChain();

const client = new APIClient({
    url: chain.url
});
const contractKit = new ContractKit({ client });
let contract;


// A service to handle wallet connections and pushing transactions to the blockchain
export class ContractService {

    static async init(){
        contract = await contractKit.load(PUBLIC_CONTRACT);
    }

    static async getComments(proposalId:number, page:number = 0): Promise<Comment[]> {
        if(!contract) await ContractService.init();

        return await contract.readonly('getcomments', {
            id: proposalId,
            limit: 30,
            offset: page * 30,
        }).then(result => {
            return result.comments.map((comment:any) => {
                const pojo = JSON.parse(JSON.stringify(comment));
                return {
                    id: pojo.id,
                    account: pojo.sender,
                    message: pojo.message,
                    burned: parseFloat(pojo.burned.split(' ')[0]),
                    date: unixDate(pojo.timestamp),
                }
            }).reverse();
        }).catch(err => {
            console.error('Get comments error:', err);
            return [];
        });
    }

    /***
     * Get proposals from the contract
     * * @param sort number - sorting method (0: by amount requested, 1: by burned amount, 2: by date)
     * * @param page number - page number for pagination
     */
    static async getProposals(sort:number = 0, page:number = 0): Promise<Proposal[]> {
        if(!contract) await ContractService.init();

        return await contract.readonly('getprops', {
            sort,
            limit: 10,
            offset: page * 10,
        }).then(result => {
            return result.proposals.map((proposal:any) => {
                const pojo = JSON.parse(JSON.stringify(proposal));
                return {
                    id: pojo.id,
                    title: pojo.title,
                    summary: pojo.summary,
                    proposer: pojo.proposer,
                    requested: pojo.requested,
                    approvals: pojo.approvals,
                    burned: parseFloat(pojo.burns.split(' ')[0]),
                    date: unixDate(pojo.timestamp),
                    msig: pojo.msig,
                }
            });
        }).catch(err => {
            console.error('Get proposals error:', err);
            return [];
        });
    }

    static async getProposal(proposalId:number): Promise<Proposal|null> {
        if(!contract) await ContractService.init();
        return await contract.readonly('getprop', {
            id: proposalId,
        }).then(result => {
            const pojo = JSON.parse(JSON.stringify(result.proposal));
            return {
                id: pojo.id,
                title: pojo.title,
                summary: pojo.summary,
                proposer: pojo.proposer,
                requested: pojo.requested,
                approvals: JSON.parse(JSON.stringify(result.approvals)),
                burned: parseFloat(pojo.burns.split(' ')[0]),
                markdown: pojo.markdown,
                date: unixDate(pojo.timestamp),
                msig: pojo.msig,
            }
        }).catch(err => {
            console.error('Get proposal error:', err);
            return null;
        });
    }

    static async getProducers(): Promise<void> {
        contractStore.producers = await client.v1.chain.get_table_rows({
            code: 'eosio',
            scope: 'eosio',
            table: 'producers',
            limit: 35,
            index_position: 'secondary',
            key_type: 'float64',
        }).then(result => {
            return result.rows.map((row:any) => row.owner);
        }).catch(err => {
            NotificationService.addNotification('Error fetching producers', 'error');
            return [];
        });
    }

    static async getUsdPrice(): Promise<number> {
        const _client = chain === Chains.Vaulta ? client : new APIClient({
            url: Chains.Vaulta.url
        });
        return await _client.v1.chain.get_table_rows({
            code: 'delphioracle',
            scope: 'ausd',
            table: 'datapoints',
            limit: 1,
        }).then(result => {
            if(result.rows.length === 0) return 0;
            return parseInt(result.rows[0].median)/10000;
        }).catch(err => {
            NotificationService.addNotification('Error fetching USD price', 'error');
            return 0;
        });
    }

    static async getProposalSigners(account:string, name:string): Promise<string[]> {
        if(!contract) await ContractService.init();
        return await client.v1.chain.get_table_rows({
            code:'eosio.msig',
            scope: account,
            table: 'approvals2',
            lower_bound: Name.from(name),
            upper_bound: Name.from(name),
        }).then(result => {
            if(result.rows.length === 0) return [];
            const pojo = JSON.parse(JSON.stringify(result.rows[0]));
            return pojo.provided_approvals.map((approval:any) => approval.actor);
        })
    }


}