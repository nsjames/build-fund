import {Chains, Session, SessionKit, APIClient} from "@wharfkit/session"
import { ContractKit } from "@wharfkit/contract"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import {PUBLIC_CONTRACT} from "$env/static/public";
import {NotificationService} from "$lib/services/notification.service.svelte";
import {TransactPluginResourceProvider} from "@wharfkit/transact-plugin-resource-provider";
import {TransactPluginAutoCorrect} from '@wharfkit/transact-plugin-autocorrect'
import {ContractService} from "$lib/services/contract.service.svelte";
import {getChain} from "$lib";
import {globalStore} from "$lib/store/global.store.svelte";
import {PopupService} from "$lib/services/popup.service.svelte";

export class WalletStore {
    public account:any = $state(null)
}

export const walletStore = new WalletStore();

const chain = getChain();
// const PROPOSAL_FUNDER = 'admin.grants';
const PROPOSAL_FUNDER = 'eosio';

const client = new APIClient({
    url: chain.url
});
const contractKit = new ContractKit({ client });
let contract;


// A service to handle wallet connections and pushing transactions to the blockchain
export class WalletService {
    public static sessionKit:SessionKit|null = null;
    public static session:Session|null = null;

    static async init(){
        const { WebRenderer } = await import("@wharfkit/web-renderer");
        const { WalletPluginScatter } = await import("@wharfkit/wallet-plugin-scatter");
        const { WalletPluginWombat } = await import("@wharfkit/wallet-plugin-wombat");
        const { WalletPluginTokenPocket } = await import("@wharfkit/wallet-plugin-tokenpocket");
        const { WalletPluginMetaMask } = await import("@wharfkit/wallet-plugin-metamask");

        contract = await contractKit.load(PUBLIC_CONTRACT);

        WalletService.sessionKit = new SessionKit({
                appName: "fund.value",
                chains: [chain],
                ui: new WebRenderer({
                    minimal: true,
                }),
                walletPlugins: [
                    new WalletPluginAnchor(),
                    new WalletPluginScatter(),
                    new WalletPluginWombat(),
                    new WalletPluginTokenPocket(),
                    new WalletPluginMetaMask(),
                ],
            },
            {
                transactPlugins: [
                    new TransactPluginResourceProvider(),
                    new TransactPluginAutoCorrect(),
                ],
            })

        // See if there was already an account logged in
        const session = await WalletService.sessionKit.restore()
        if(session) {
            WalletService.session = session
            walletStore.account = session.actor.toString();
        }
    }


    static async login(){
        if(!WalletService.sessionKit) await WalletService.init();
        WalletService.session = (x => x ? x.session : null)(await WalletService.sessionKit?.login().catch(err => {
            console.error('login error', err)
            return null;
        }))

        walletStore.account = WalletService.session
            ? WalletService.session.actor.toString()
            : null;
    }

    static async logout(){
        await WalletService.sessionKit?.logout()
        walletStore.account = null;
    }

    static async burn(proposalId:number, amount:number, token:'EOS'|'A', message?:string) {
        if (!WalletService.session) return NotificationService.addNotification('Please login first.', 'error');
        if ((proposalId !== 0 && !proposalId) || !amount) return NotificationService.addNotification('Invalid parameters for burn', 'error');
        if (amount <= 0) return NotificationService.addNotification('Amount must be greater than zero.', 'error');
        if (token !== 'EOS' && token !== 'A') return NotificationService.addNotification('Invalid token for burn', 'error');

        const fixedAmount = parseFloat(amount.toString()).toFixed(4);
        return await WalletService.session.transact({
            actions: [
                {
                    account: token === 'EOS' ? 'eosio.token' : 'core.vaulta',
                    name: 'buyrambytes',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        payer: walletStore.account,
                        receiver: PUBLIC_CONTRACT,
                        bytes: 40
                    }
                },
                {
                    account: token === 'EOS' ? 'eosio.token' : 'core.vaulta',
                    name: 'transfer',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        from: walletStore.account,
                        to: PUBLIC_CONTRACT,
                        quantity: `${fixedAmount} ${token}`,
                        memo: `${proposalId}`
                    }
                },
                {
                    account: PUBLIC_CONTRACT,
                    name: 'burn',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        burner: walletStore.account,
                        id: proposalId,
                        quantity: `${fixedAmount} BURNED`,
                        message: message || undefined,
                    }
                }
            ]
        }).then(res => {
            return JSON.parse(JSON.stringify(res.returns[0].data))
        }).catch(err => {
            console.error('Burn tokens error:', err);
            NotificationService.addNotification("Could not burn tokens, see console for more information", 'error');
            return null;
        });

    }

    static async cancel(proposalId:number, msig:string) {
        if (!WalletService.session) return NotificationService.addNotification('Please login first.', 'error');
        if (proposalId !== 0 && !proposalId) return NotificationService.addNotification('Invalid parameters for cancel', 'error');

        return await WalletService.session.transact({
            actions: [
                // cancel MSIG
                {
                    account: 'eosio.msig',
                    name: 'cancel',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        proposer: walletStore.account,
                        proposal_name: msig,
                        canceler: walletStore.account
                    }
                },
                // cancel Proposal
                {
                    account: PUBLIC_CONTRACT,
                    name: 'cancel',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        id: proposalId,
                    }
                }
            ]
        }).then(() => true).catch(err => {
            console.error('Cancel proposal error:', err);
            NotificationService.addNotification("Could not cancel proposal, see console for more information", 'error');
            return null;
        });

    }

    static async propose(title:string, summary:string, requested:string, markdown:string, producers:string[]){
        try {
            if (!WalletService.session) return NotificationService.addNotification('Please login first.', 'error');
            if (!title || !summary || !requested || !markdown) return NotificationService.addNotification('Invalid parameters for propose', 'error');


            let ticker = requested.split(' ')[1];
            if(ticker === 'USD'){
                const price = await ContractService.getUsdPrice();
                if(price <= 0) return NotificationService.addNotification('Could not fetch USD price for proposal', 'error');
                const amount = parseFloat(requested.split(' ')[0]);
                const eosAmount = (amount / price).toFixed(4);
                requested = `${eosAmount} EOS`;
                ticker = 'EOS';
            }
            const contract = ticker === 'EOS' ? 'eosio.token' : ticker === 'A' ? 'core.vaulta' : null;
            if(!contract) return NotificationService.addNotification('Requested token must be EOS or A', 'error');

            globalStore.proposingSteps.resetProposingSteps();
            PopupService.proposing();

            // random name based off title + timestamp, conforms to EOSIO name rules
            const proposalNameBase = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
            const proposalName = `${proposalNameBase}${(+new Date()).toString().slice(-8)}`;

            // create an MSIG that asks the `eosio.fund` account for the requested funds
            const msigAction = {
                account: 'eosio.msig',
                name: 'propose',
                authorization: [{
                    actor: walletStore.account,
                    permission: 'active'
                }],
                data: {
                    proposer: walletStore.account,
                    proposal_name: proposalName,
                    requested: [
                        ...producers.map(producer => ({
                            actor: producer,
                            permission: 'active'
                        }))
                    ],
                    trx: {
                        expiration: new Date(new Date().getTime() + 3600 * 1000).toISOString().split('.')[0],
                        ref_block_num: 0,
                        ref_block_prefix: 0,
                        max_net_usage_words: 0,
                        max_cpu_usage_ms: 0,
                        delay_sec: 0,
                        context_free_actions: [],
                        actions: [
                            {
                                account: contract,
                                name: 'transfer',
                                authorization: [{
                                    actor: PROPOSAL_FUNDER,
                                    permission: 'active'
                                }],
                                data: {
                                    from: PROPOSAL_FUNDER,
                                    to: walletStore.account,
                                    quantity: requested,
                                    memo: `Funding request for proposal: ${title}`
                                }
                            }
                        ],
                        transaction_extensions: []
                    }
                }
            }


            const msigResult:any = await WalletService.session.transact({
                actions: [
                    msigAction
                ]
            }).catch(err => {
                console.error('Propose error:', err);
                NotificationService.addNotification("Could not create proposal, see console for more information", 'error');
                globalStore.proposingSteps.errorAllProposingSteps();
                return null;
            });
            if(!msigResult) return null;

            globalStore.proposingSteps.advanceProposingStep();

            const proposalTxid = await WalletService.session.transact({
                actions: [
                    {
                        account: PUBLIC_CONTRACT,
                        name: 'propose',
                        authorization: [{
                            actor: walletStore.account,
                            permission: 'active'
                        }],
                        data: {
                            proposer: walletStore.account,
                            title,
                            summary,
                            requested,
                            msig: proposalName,
                            markdown
                        }
                    }
                ]
            }).catch(err => {
                console.error('Propose error:', err);
                NotificationService.addNotification("Could not create proposal, see console for more information", 'error');
                globalStore.proposingSteps.setCancelMsigSteps();
                return null;
            });

            if(!proposalTxid) {
                await WalletService.session.transact({
                    actions: [
                        {
                            account: 'eosio.msig',
                            name: 'cancel',
                            authorization: [{
                                actor: walletStore.account,
                                permission: 'active'
                            }],
                            data: {
                                proposer: walletStore.account,
                                proposal_name: proposalName,
                                canceler: walletStore.account
                            }
                        }
                    ]
                }).then(() => {
                    globalStore.proposingSteps.finishProposingSteps();
                }).catch(err => {
                    console.error('Failed to cancel msig after proposal failure:', err);
                    globalStore.proposingSteps.errorAllProposingSteps();
                });

                return null;
            }

            globalStore.proposingSteps.finishProposingSteps();

            return {
                msigTxid: msigResult.response?.transaction_id,
                proposalTxid: proposalTxid.response?.transaction_id,
                id:JSON.parse(JSON.stringify(proposalTxid?.returns[0].data))
            }
        } catch (err) {
            console.error('Propose error:', err);
            NotificationService.addNotification("Could not create proposal, see console for more information", 'error');
            globalStore.proposingSteps.errorProposingStep();
            return null;
        }


    }

    static async signProposal(msig:string) {
        if (!WalletService.session) return NotificationService.addNotification('Please login first.', 'error');
        if (!msig) return NotificationService.addNotification('Invalid parameters for signProposal', 'error');

        return await WalletService.session.transact({
            actions: [
                {
                    account: 'eosio.msig',
                    name: 'approve',
                    authorization: [{
                        actor: walletStore.account,
                        permission: 'active'
                    }],
                    data: {
                        proposer: walletStore.account,
                        proposal_name: msig,
                        level: {
                            actor: walletStore.account,
                            permission: 'active'
                        }
                    }
                }
            ]
        }).then(() => true).catch(err => {
            console.error('Sign proposal error:', err);
            NotificationService.addNotification("Could not sign proposal, see console for more information", 'error');
            return null;
        });
    }



}