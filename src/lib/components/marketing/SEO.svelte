<script lang="ts">
    const {title, description, image = 'https://build-fund.com/meta.png', url, canonical = url,
        keywords = ""
    } = $props();

    const author = "nsjames";
</script>

<svelte:head>
    <title>Build Fund - {title}</title>
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    <meta property="og:url" content="{url}">
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">
    <meta name="author" content="{author}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    <meta name="twitter:url" content="{url}">
    <link rel="canonical" href="{canonical}">
</svelte:head>