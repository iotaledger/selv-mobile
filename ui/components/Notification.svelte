<script>
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { error } from '~/lib/store';
</script>

<style>
    p {
        cursor: pointer;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 12vh;
        line-height: 12vh;
        text-align: center;
        font-weight: 500;
        color: #fff;
        background: #67dab0;
        z-index: 10;
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 3.5vw;
    }
    p.error {
        color: #fff;
        background: #f76c5e;
    }
</style>

{#if $error}
    <p
        class="error"
        transition:fly="{{ y: -20, duration: 250, opacity: 0, easing: quintOut }}"
        on:click="{() => error.set(null)}"
    >
        {$error}
    </p>
{/if}
