<script>
    import { fly, scale, fade } from 'svelte/transition';

    import path from '~/lib/router';

    export let route;
    export let entry;
    export let onboarding;
    export let onboardingHome;
    export let home;
    export let menu;
    export let modal;
    export let transparent;
</script>

<style>
    div {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background-color: transparent;
    }

    div.transparent {
        background: none;
    }
</style>

{#if $path === route}
    {#if entry}
        <div class:transparent in:scale="{{ duration: 380, start: 0.95, oapcity: 0.9 }}">
            <slot />
        </div>
    {:else if onboarding}
        <div class:transparent transition:fly="{{ x: 360, duration: 280, opacity: 0 }}">
            <slot />
        </div>
    {:else if onboardingHome}
        <div class:transparent in:fly="{{ x: 360, duration: 280, opacity: 0 }}">
            <slot />
        </div>
    {:else if modal}
        <div class:transparent transition:fly="{{ y: 50, duration: 280, opacity: 0 }}">
            <slot />
        </div>
    {:else if home}
        <div class:transparent>
            <slot />
        </div>
    {:else if menu}
        <div class:transparent transition:fly="{{ x: 360, duration: 280, opacity: 0 }}">
            <slot />
        </div>
    {/if}
{/if}
