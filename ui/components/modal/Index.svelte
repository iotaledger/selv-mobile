<script>
    import { onDestroy, setContext as baseSetContext } from 'svelte';
    import { fade } from 'svelte/transition';

    import { modalStatus } from '~/lib/store';

    export let key = 'simple-modal';
    export let closeOnEsc = true;
    export let closeOnOuterClick = true;
    export let background = '#eef2fa';
    export let styleBg = { top: 0, left: 0 };
    export let styleWindow = {};
    export let styleContent = {};
    export let setContext = baseSetContext;
    export let transitionBg = fade;
    export let transitionBgProps = { duration: 250 };
    export let transitionWindow = transitionBg;
    export let transitionWindowProps = transitionBgProps;

    const defaultState = {
        closeOnEsc,
        closeOnOuterClick,
        background,
        styleBg,
        styleWindow,
        styleContent,
        transitionBg,
        transitionBgProps,
        transitionWindow,
        transitionWindowProps
    };
    let state = { ...defaultState };

    let Component = null;
    let props = null;

    let bg;
    let wrap;

    const camelCaseToDash = (str) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

    const toCssString = (props) => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '');

    $: cssBg = toCssString(state.styleBg);
    $: cssWindow = toCssString({ ...state.styleWindow, background: state.background });
    $: cssContent = toCssString({ ...state.styleContent, background: state.background });
    $: currentTransitionBg = state.transitionBg;
    $: currentTransitionWindow = state.transitionWindow;

    const open = (NewComponent, newProps = {}, options = {}) => {
        Component = NewComponent;
        props = newProps;
        state = { ...defaultState, ...options };
    };

    const close = () => {
        Component = null;
        props = null;

        // Reset modal status in store
        modalStatus.set({ active: false, type: null, subtype: null });
    };

    const handleKeyup = ({ key }) => {
        if (state.closeOnEsc && Component && key === 'Escape') {
            event.preventDefault();
            close();
        }
    };

    const handleOuterClick = (event) => {
        if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
            event.preventDefault();
            close();
        }
    };

    setContext(key, { open, close });

    const unsubscribe = modalStatus.subscribe((status) => {
        if (
            !status.active &&
            // Also check if any component instance is active
            Component
        ) {
            close();
        }
    });

    onDestroy(unsubscribe);
</script>

<style>
    * {
        box-sizing: border-box;
    }

    .bg {
        position: absolute;
        z-index: 1000;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(19, 20, 63, 0.87);
    }

    .window-wrap {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
    }

    .window {
        position: relative;
        width: 50rem;
        max-width: 100%;
        max-height: 100%;
        color: black;
        border-radius: 0.5rem;
        background: #eef2fa;
    }

    .content {
        position: relative;
        padding: 1rem 0;
        max-height: calc(100vh - 4rem);
        overflow: auto;
        background: #eef2fa;
        min-height: 320px;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
    }
</style>

<svelte:window on:keyup="{handleKeyup}" />

<div>
    {#if Component}
        <div
            class="bg"
            on:click="{handleOuterClick}"
            bind:this="{bg}"
            transition:currentTransitionBg="{state.transitionBgProps}"
            style="{cssBg}"
        >
            <div class="window-wrap" bind:this="{wrap}">
                <div class="window" transition:currentTransitionWindow="{state.transitionWindowProps}" style="{cssWindow}">
                    <div class="content" style="{cssContent}">
                        <svelte:component this="{Component}" {...props} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <slot />
</div>
