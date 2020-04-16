<script>
    import Spinner from '~/components/Spinner';

    export let label;
    export let onClick;
    export let disabled = false;
    export let loading = false;
</script>

<style>
    button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 54px;
        font-size: 14px;
        font-weight: 700;
        border-radius: 100px;
        cursor: pointer;
    }

    button.disabled {
        pointer-events: none;
        opacity: 0.5;
    }

    button :global(img) {
        padding-right: 12px;
    }
</style>

<button class:disabled on:click="{onClick}">
    {#if loading}
        <Spinner />
    {:else}
        <slot />
        {label}
    {/if}
</button>
