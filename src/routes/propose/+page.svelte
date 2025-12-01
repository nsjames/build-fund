<script lang="ts">
    import SEO from "$lib/components/marketing/SEO.svelte";
    import Markdown from "$lib/components/Markdown.svelte";
    import MarkdownIt from 'markdown-it';
    import sanitizeHtml from 'sanitize-html';
    import Fluid from "$lib/components/Fluid.svelte";
    import { Carta, MarkdownEditor } from 'carta-md';
    import 'carta-md/default.css';
    import {onMount} from "svelte";
    import {LocalDB} from "$lib/services/localdb.service";
    import {NotificationService} from "$lib/services/notification.service.svelte";
    import {WalletService, walletStore} from "$lib/services/wallet.service.svelte";
    import {ContractService, contractStore} from "$lib/services/contract.service.svelte";
    import {goto} from "$app/navigation";
    import {commaSeparatedNumber, getSummaryMaxLength} from "$lib";
    import {PopupService} from "$lib/services/popup.service.svelte";
    import {globalStore} from "$lib/store/global.store.svelte";

    const carta = new Carta();


    let title = $state('');
    let summary = $state('');
    let amount = $state(0);

    const TOKENS = {
        EOS: {
            symbol: 'EOS',
            precision: 4,
        },
        USD: {
            symbol: 'USD',
            precision: 2,
        },
        Vaulta: {
            symbol: 'A',
            precision: 4,
        },
    }

    let token:string = $state(TOKENS.USD.symbol);
    let howGenerateFees = $state(false);
    let howIncreasingTransactions = $state(false);
    let openSource = $state(false);
    let systemControlled = $state(false);
    let author = $state('');


    let markdown = $state(``);

    const md = new MarkdownIt({ html: false });
    const fullMarkdown = $derived.by(() => {
        return `\r\n# ${title}
        \r\nAuthor: **${author}**

        \r\nAmount Requested: **${commaSeparatedNumber(amount)} ${TOKENS[token].symbol}**

        \r\n## Elevator Pitch

        \r\n${summary}

        \r\n---
        \r\n[]()

        \r\n${markdown}`
    });

    // Don't need the other fields in the saved markdown, and if the USD token is not selected the amount actually proposed
    // is already logged in the proposal request, so we can skip that line too.
    const saveableMarkdown = $derived.by(() => {
        return `Author: **${author}**

        ${token === TOKENS.USD.symbol ? `\r\nAmount Requested: **${commaSeparatedNumber(amount)} ${TOKENS[token].symbol}**` : ``}

        \r\n${markdown}`
    });
    const html = $derived.by(() => md.render(fullMarkdown));
    const sanitized = $derived.by(() => sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img', 'span', 'pre', 'code', 'div'
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,

            // Allow Prism language classes
            code: ['class'],
            pre: ['class'],

            // Allow mermaid <div class="mermaid"> block output
            div: ['class'],
            span: ['class'],
        },

        // If you want to allow "style" attributes (optional)
        allowedStyles: {
            '*': {
                'color': [/^.*$/],
                'background-color': [/^.*$/],
            }
        }
    }));

    const scrollWithEditor = () => {
        const editor = document.querySelector('.carta-input');
        const preview = document.querySelector('.carta-md-preview');

        if (editor && preview) {
            const editorScrollTop = editor.scrollTop;
            const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
            const scrollRatio = editorScrollTop / editorScrollHeight;

            const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
            preview.scrollTop = scrollRatio * previewScrollHeight;
        }
    };

    let loading = $state(true);
    onMount(async () => {
        const savedProposal:any = await LocalDB.get('proposal');
        if (savedProposal) {
            title = savedProposal.title || '';
            summary = savedProposal.summary || '';
            amount = savedProposal.amount || 0;
            token = savedProposal.token || TOKENS.USD;
            howGenerateFees = savedProposal.howGenerateFees || false;
            howIncreasingTransactions = savedProposal.howIncreasingTransactions || false;
            openSource = savedProposal.openSource || false;
            systemControlled = savedProposal.systemControlled || false;
            markdown = savedProposal.markdown || '';
            author = savedProposal.author || '';
        }
        loading = false;

        const editor = document.querySelector('.carta-input');
        if (editor) {
            editor.addEventListener('scroll', scrollWithEditor);
        }
    })

    let forceRefresh = $state(false);
    let timer: NodeJS.Timeout;
    const refresh = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            forceRefresh = true;
            setTimeout(() => {
                forceRefresh = false;
            }, 100);
        }, 100);
    }

    let saveTimeout: NodeJS.Timeout;
    const persistProposal = () => {
        if(loading) return;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(async () => {
            await LocalDB.set('proposal', {
                title,
                summary,
                amount,
                token,
                howGenerateFees,
                howIncreasingTransactions,
                openSource,
                systemControlled,
                markdown,
                author
            });
        }, 1500);


    }

    const onEnterText = () => {
        scrollWithEditor();
        refresh();
    }

    $effect(() => {
        markdown;
        onEnterText();
    })

    const scrollPreviewToTop = () => {
        const preview = document.querySelector('.carta-md-preview');
        if (preview) {
            preview.scrollTop = 0;
        }
    }

    $effect(() => {
        title;
        summary;
        amount;
        author;
        scrollPreviewToTop();
        refresh();
    })

    $effect(() => {
        title;
        summary;
        amount;
        token;
        howGenerateFees;
        howIncreasingTransactions;
        openSource;
        systemControlled;
        markdown;
        author;
        persistProposal();
    })

    const propose = async () => {
        if(!walletStore.account) return NotificationService.connectWallet();
        if(!title) return NotificationService.addNotification('Please enter a title for your proposal', 'error');
        if(title.length > 226) return NotificationService.addNotification('Title must be less than 226 characters', 'error');
        if(!summary) return NotificationService.addNotification('Please enter a summary for your proposal', 'error');
        if(summary.length > getSummaryMaxLength()) return NotificationService.addNotification(`Summary must be less than ${getSummaryMaxLength()} characters`, 'error');
        if(!author || author.length < 3) return NotificationService.addNotification('Please enter a valid author name for your proposal (at least 3 characters)', 'error');
        if(amount <= 0) return NotificationService.addNotification('Please enter a valid amount for your proposal', 'error');
        if(!howGenerateFees) return NotificationService.addNotification('Please outline how this product will generate fees for the network', 'error');
        if(!howIncreasingTransactions) return NotificationService.addNotification('Please outline how this product will increase transactions on the network', 'error');
        if(!openSource) return NotificationService.addNotification('Please confirm that this product will be open source', 'error');
        if(!systemControlled) return NotificationService.addNotification('Please confirm that this product will be controlled by eosio', 'error');
        if(!markdown) return NotificationService.addNotification('Please outline your proposal in detail', 'error');
        if(!contractStore.producers.length) {
            await ContractService.getProducers();
            if(!contractStore.producers.length) {
                return NotificationService.addNotification('Unable to fetch block producers. Please try again later.', 'error');
            }
        }


        const requested = parseFloat(amount.toString()).toFixed(TOKENS[token].precision) + ' ' + TOKENS[token].symbol;
        const result = await WalletService.propose(title, summary, requested, saveableMarkdown, contractStore.producers);
        if(!result) return;
        await LocalDB.remove('proposal');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await goto(`/proposals/${result.id}`);
    }

</script>

<SEO
    title={`- Propose a Product`}
    url={`https://build-fund.com/propose`}
    description="A platform to submit and fund proposals for projects building on the EOS/Value blockchain. Empowering developers and innovators to bring their ideas to life with network support."
/>

<section class="relative px-30 max-lg:px-6 pt-20 bg-black pb-60">
    <section class="w-full absolute top-0 bottom-0 left-0 right-0 max-lg:fixed ">
        <figure class="max-lg:hidden fade-to-black"></figure>
        <Fluid forcedConfig={{
                DENSITY_DISSIPATION: Math.random() * 4 + 2,
                VELOCITY_DISSIPATION: Math.random() * 4 + 1,
                PRESSURE: Math.random() * 0.8 + 0.05,
                PRESSURE_ITERATIONS: Math.random() * 50 + 0.5,
                CURL: Math.random() * 30 + 0.01,
                SPLAT_RADIUS: Math.random() * 0.9 + 0.05,
                SPLAT_FORCE: Math.random() * 50000 + 1,
                COLOR_UPDATE_SPEED: Math.random() * 10 + 1,
            }} />
    </section>
    <section class="pt-30 relative w-full flex justify-center items-center flex-col max-w-3xl mx-auto text-center text-white">
        <figure class="flex items-center gap-2 text-xs text-white/50 max-w-xl">

        </figure>
        <h1 class="text-7xl serif max-lg:text-3xl mt-4">
            Propose a Product.
        </h1>

        <figure class="text-md mt-10 max-w-2xl max-lg:text-sm max-lg:mt-4">
            You have a unique opportunity to shape the future of our network by proposing a product that can drive real value and innovation. Share your vision, and let the community and block producers decide if it gets funded.
        </figure>


        <section class="px-30 max-lg:px-6 mx-auto text-center mt-20 max-w-5xl">
            <figure class="text-xs font-bold italic text-white/40">
                Products must follow these rules
            </figure>


        </section>

        <section class="flex gap-x-20 gap-y-5 justify-center relative mt-3 flex-wrap">
            <section class="flex gap-2 items-center max-lg:mt-3">
                <svg class="fill-white/70" width="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M27.939 18.5093C29.1657 17.8177 30 16.5019 30 15C30 13.4981 29.1657 12.1824 27.939 11.4907C26.813 10.8563 26.2831 9.57617 26.6309 8.3317C27.0105 6.97512 26.6691 5.45552 25.6068 4.39323C24.5444 3.33091 23.0248 2.98953 21.6683 3.36912C20.4238 3.71686 19.1437 3.18697 18.5093 2.06096C17.8177 0.834324 16.5019 0 15 0C13.4981 0 12.1824 0.834324 11.4907 2.06096C10.8563 3.18697 9.57617 3.71686 8.3317 3.36912C6.97511 2.98953 5.45552 3.33091 4.39323 4.39323C3.33091 5.45555 2.98953 6.97518 3.36912 8.3317C3.71686 9.57617 3.18697 10.8563 2.06096 11.4907C0.834324 12.1823 0 13.4981 0 15C0 16.5019 0.834324 17.8176 2.06096 18.5093C3.18697 19.1437 3.71686 20.4238 3.36912 21.6683C2.98953 23.0249 3.33091 24.5445 4.39323 25.6068C5.45555 26.6691 6.97518 27.0105 8.3317 26.6309C9.57617 26.2831 10.8563 26.813 11.4907 27.939C12.1823 29.1657 13.4981 30 15 30C16.5019 30 17.8176 29.1657 18.5093 27.939C19.1437 26.813 20.4238 26.2831 21.6683 26.6309C23.0249 27.0105 24.5445 26.6691 25.6068 25.6068C26.6691 24.5444 27.0105 23.0248 26.6309 21.6683C26.2831 20.4238 26.813 19.1424 27.939 18.5093ZM14.9999 23.142C10.5149 23.142 6.85789 19.4837 6.85789 15C6.85789 10.515 10.5162 6.85795 14.9999 6.85795C19.4849 6.85795 23.142 10.5163 23.142 15C23.142 19.485 19.4849 23.142 14.9999 23.142ZM19.2071 11.8539C19.5828 12.2297 19.5828 12.8385 19.2071 13.2143L14.2737 18.1464C13.898 18.5221 13.2891 18.5221 12.9133 18.1464L10.7912 16.0243C10.4155 15.6485 10.4155 15.0397 10.7912 14.6639C11.167 14.2881 11.7759 14.2881 12.1516 14.6639L13.5948 16.1071L17.848 11.8539C18.2237 11.4782 18.8326 11.4782 19.2071 11.8539Z"/>
                </svg>
                <figure class="text-xs font-bold text-white">
                    Open Source
                </figure>
            </section>
            <section class="flex gap-2 items-center">
                <svg class="fill-white/70" width="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 0C6.72919 0 0 6.72919 0 15C0 23.2708 6.72919 30 15 30C23.2708 30 30 23.2708 30 15C30 6.72919 23.2708 0 15 0ZM15 27.0014C8.38275 27.0014 2.9986 21.6176 2.9986 15C2.9986 8.38242 8.38275 2.9986 15 2.9986C21.6172 2.9986 27.0014 8.38275 27.0014 15C27.0014 21.6172 21.6172 27.0014 15 27.0014Z"/>
                    <path d="M16.4993 5.2959H13.5007V14.5626V15.8223L14.5626 16.4993L22.1474 21.3357L23.7596 18.8073L16.4993 14.1778V5.2959Z"/>
                </svg>
                <figure class="text-xs font-bold text-white">
                    System Controlled
                </figure>
            </section>
            <section class="flex gap-2 items-center">
                <svg class="fill-white/70" width="20" viewBox="0 0 30 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7281 2.62119L21.9424 5.51206L16.5853 10.7868L9.85058 4.14213L0 13.8718L3.14869 16.9784L9.85058 10.3661L16.5853 17L25.2442 8.46764L28.4147 11.3154L30 0L18.7281 2.62119Z"/>
                </svg>
                <figure class="text-xs font-bold text-white">
                    Generate Fees
                </figure>
            </section>
        </section>

    </section>

</section>

<section class="-mt-40 relative">
    <div class="max-w-[1500px] z-[10000] mx-auto px-6">
        <section class="flex items-end justify-end max-lg:w-full max-lg:justify-center">
            <button onclick={propose} class="cursor-pointer btn-animate bg-blue-500 text-white px-6 py-3 mt-3 rounded-lg font-bold max-lg:text-lg max-lg:w-full">
                Submit Proposal
            </button>
        </section>
        <div class="bg-white shadow-lg rounded-xl p-6 h-full mt-3">
            <section class="flex max-lg:flex-col">
                <section class="flex-1 min-lg:w-1/2">
                    <section class="">
                        <input type="text" bind:value={title} placeholder="Give your proposal a title." class="w-full text-3xl font-bold border-b border-black/10 rounded p-2 mb-4 outline-none" />
                        <input type="text" bind:value={author} placeholder="Author Name" class="w-full text-lg font-bold border-b border-black/10 rounded p-2 mb-6 outline-none" />
                        <!-- summary with letter counter -->
                        <section class="flex justify-between items-center mb-6 relative pb-10 border-1 rounded p-2 border-black/10">
                            <textarea bind:value={summary} placeholder="Write a brief summary of your proposal (elevator pitch)." class="w-full resize-none h-16 pb-2 outline-none max-h-32" maxlength={getSummaryMaxLength()}></textarea>
                            <figure class="absolute bottom-2 right-2 text-sm text-black/50 ml-4">{summary.length}/{getSummaryMaxLength()}</figure>
                        </section>

                        <hr class="my-10 border-black/5" />

                        <figure class="text-sm font-bold mt-10 block">
                            How much are you asking for?
                        </figure>
                        <section class="max-w-sm">
                            <section class="flex gap-2 border border-black/10 rounded-lg p-1 mt-2">
                                <input bind:value={amount} class="w-full text-lg font-bold text-black outline-0 ring-0 px-2" />
                                <section class="w-[90px]" style="flex: 0 0 auto;">
                                    <select bind:value={token}
                                            class="w-full p-2 bg-neutral-900 border border-zinc-700 rounded text-black
                               focus:ring-0 focus:border-zinc-500 outline-none font-black">
                                        {#each Object.values(TOKENS) as t}
                                            <option value={t.symbol}>{t.symbol}</option>
                                        {/each}
                                    </select>
                                </section>
                            </section>
                            <section class="flex gap-2 mt-2">
                                {#each ['1,000','10,000','100,000'] as preset}
                                    <button onclick={() => amount = parseInt(preset.replace(',', ''))} class="cursor-pointer px-2 py-2 font-bold flex-1 border bg-black btn-animate text-white
            rounded text-xs hover:bg-white/20 {amount === parseInt(preset.replace(',', '')) ? 'bg-white text-black! border-black border' : ''}">
                                        {preset}
                                    </button>
                                {/each}
                            </section>
                        </section>

                        <section class="flex flex-col gap-4 text-xs mt-10">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" bind:checked={howGenerateFees} class="w-5 h-5" />
                                <span class="text-black font-bold">I outlined how this product will generate and channel fees to <pre class="inline text-blue-500"><code>eosio.fees</code></pre></span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" bind:checked={howIncreasingTransactions} class="w-5 h-5" />
                                <span class="text-black font-bold">I outlined how this product will increase transactions on the network</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" bind:checked={openSource} class="w-5 h-5" />
                                <span class="text-black font-bold">This product will be open source</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" bind:checked={systemControlled} class="w-5 h-5" />
                                <span class="text-black font-bold">This product will be controlled by <pre class="inline text-blue-500"><code>eosio</code></pre></span>
                            </label>
                        </section>
                    </section>


                    <hr class="my-10 border-black/5" />

                    <figure class="mt-10 text-xl font-bold">
                        Outline your proposal in detail below
                    </figure>
                    <figure class="mt-3 text-xs mb-3">
                        Make sure you cover each of the following points:
                        <ul class="list-disc list-inside text-black/60 font-bold mt-1">
                            <li>What problem does this product solve?</li>
                            <li>What is the addressable market?</li>
                            <li>How does it generate fees for the network?</li>
                            <li>What are the tokens for, and how will they be used?</li>
                            <li>What milestones will you achieve with the requested funding?</li>
                            <li>How will success be measured?</li>
                        </ul>
                    </figure>
                    <section class="flex-1 mt-8">
                        <MarkdownEditor bind:value={markdown} {carta} />
                    </section>
                </section>

                <section class="min-lg:w-1/2 sticky top-5 flex-1 flex max-lg:flex-col gap-2 min-lg:max-h-[690px]">
                    <section class="relative flex-1 rounded p-5 overflow-y-scroll carta-md-preview">
                        <Markdown {forceRefresh} nocopy={true}>
                            {@html sanitized}
                        </Markdown>
                    </section>
                </section>
            </section>
        </div>
    </div>
</section>

<figure class="-mt-20"></figure>
<figure class="bg-black h-[100px]">

</figure>

<style lang="scss">
    :global(footer){
        margin-top:0;
    }

    select {
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: black;
    }

    select option {
        background-color: rgba(255, 255, 255, 1);
        color: black;
    }

    select option:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>


