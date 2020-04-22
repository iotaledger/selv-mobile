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
        height: 8vh;
        font-size: 4vw;
        font-weight: 700;
        border-radius: 27vw;
        cursor: pointer;
    }

    button.disabled {
        pointer-events: none;
        opacity: 0.5;
    }

    button :global(img) {
        margin-right: 12px;
        width: 3vh;
        height: 3vh;
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
