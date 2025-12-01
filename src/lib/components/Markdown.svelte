<script lang="ts">
    import { onMount } from "svelte";
    import "$lib/styles/markdown.scss";
    import mermaid from "mermaid";

    let { children, class:clazz = "", forceRefresh = false, nocopy = false } = $props();

    const refresh = () => {
        const mermaidBlocks = document.querySelectorAll("pre code.language-mermaid");
        mermaidBlocks.forEach((block) => {
            const pre = block.parentElement as HTMLElement;
            const content = block.innerText;

            const container = document.createElement("div");
            container.className = "mermaid";
            container.textContent = content;
            pre.replaceWith(container);
        });

        mermaid.run();

        if(!nocopy) {
            // a hack to add a copy button to all pre/code elements
            let pres: HTMLCollection = document.getElementsByTagName("pre");
            for (let _ of pres) {
                const pre = _ as HTMLPreElement;
                let copyButton = document.createElement("button");
                copyButton.addEventListener(
                    "click",
                    () => {
                        navigator.clipboard.writeText(pre.innerText)
                            .then(() => {
                                copyButton.innerHTML = `copied!`;
                                setTimeout(() => {
                                    copyButton.innerHTML = `copy`;
                                }, 1000);
                            })
                            .catch((err) => {
                                console.error("Failed to copy: ", err);
                            });
                    }
                );
                copyButton.className = "copy-tooltip";
                copyButton.ariaLabel = "Copy code";
                copyButton.innerHTML = `copy`;
                pre.appendChild(copyButton);
            }
        }
    }

    mermaid.initialize({ startOnLoad: false });

    onMount(() => {
        refresh();
    });

    $effect(() => {
        if (forceRefresh) {
            refresh();
        }
    })
</script>

<section class="{clazz} markdown">
    {@render children()}
</section>

<style lang="scss">
    :global(.copy-tooltip) {
        position: absolute;
        top: 6px;
        right: 6px;
    }
</style>
