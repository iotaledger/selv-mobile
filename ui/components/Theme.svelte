<script>
    import { onMount } from 'svelte';
    import Hammer from 'hammerjs';

    import { goto } from '~/lib/helpers';
    import path from '~/lib/router';

    onMount(() => {
        if (window.matchMedia('(pointer: coarse)').matches) {
            const hammer = new Hammer(document.body);

            hammer.on('swiperight', () => {
                if ($path === 'credential-info' || $path === 'scan') {
                    goto('home');
                }
                if ($path === 'onboarding/name') {
                    goto('onboarding/landing');
                }
            });
        }
    });
</script>

<style>
    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Inter Light'), local('Inter-Light'), url('/inter-light.woff2') format('woff2');
    }

    @font-face {
        font-family: 'Metropolis';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: local('Metropolis Bold'), local('Metropolis-Bold'), url('/metropolis-bold.woff2') format('woff2');
    }

    @font-face {
        font-family: 'Metropolis';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: local('Metropolis Regular'), local('Metropolis-Regular'), url('/metropolis-regular.woff2') format('woff2');
    }

    :global(body > main) {
        --max-width: 425px;
        --max-height: 680px;

        --bg: #f2f7fb;
        --bg-secondary: #1b65d0;

        --primary: #4b4fe3;
        --primary-fg: #eff0ff;

        --button-bg: #2c80fc;
        --button-fg: #ffffff;

        --input-bg: #ffffff;
        --input-border: #d9e1ee;
        --input-placeholder: #9ca1ab;
        --input-active: #677ca9;

        --qr: #13c4a3;
        --qr-bg: #1b65d0;

        --splash-bg: linear-gradient(91.35deg, #1b65d0 9.6%, #1962cb 88.79%);
    }

    :global(*, *:after, *:before) {
        margin: 0;
        padding: 0;
        border: 0;
        font-weight: 400;
        box-sizing: border-box;
        outline: none;
    }

    :global(html, body) {
        width: 100%;
        height: 100%;
        background: #e5e5e5;
        font-weight: 400;

        background-size: cover;
        transition: background 0.25s;
    }

    :global(body) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(button) {
        font-family: 'Poppins', sans-serif;
        cursor: pointer;
        box-shadow: 0px 2px 20px rgba(78, 83, 229, 0.4);
        background: var(--button-bg);
        color: var(--button-fg);
    }

    :global(input, textarea) {
        padding: 0 24px;
        background: var(--input-bg);
        border-radius: 29px;
        box-sizing: border-box;
        border: 2px solid var(--input-border);
        -webkit-appearance: none;
        color: var(--input-placeholder);
        font-family: 'Inter', sans-serif;
        font-style: normal;
        font-size: 16px;
        width: 100%;
        height: 52px;
        line-height: 20px;
        resize: none;
        transition: border-color 0.12s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :global(input::-ms-clear) {
        display: none;
        width: 0;
        height: 0;
    }

    :global(input:focus) {
        border-color: var(--input-active);
    }

    @media only screen and (max-height: 600px) {
        :global(input, textarea) {
            margin-bottom: 16px;
        }
    }

    :global(::placeholder) {
        color: var(--input-placeholder);
        font-size: 16px;
        font-family: 'Inter', sans-serif;
        font-style: normal;
    }

    @media only screen and (max-height: 600px) {
        :global(::placeholder) {
            line-height: 20px;
        }
    }

    @media only screen and (max-height: 600px) {
        :global(input, textarea) {
            margin-bottom: 16px;
        }
    }

    @media only screen and (max-height: 600px) {
        :global(::placeholder) {
            line-height: 20px;
        }
    }

    :global(label) {
        display: block;
        font-weight: 600;
        margin-bottom: 7px;
    }

    :global(label span) {
        font-weight: 600;
    }

    :global(svg) {
        overflow: visible;
    }

    :global(body > main) {
        width: 100%;
        height: 100%;
        margin: 0 auto;
        max-width: var(--max-width);
        max-height: var(--max-height);
        background: var(--bg);
        color: var(--fg);
        user-select: none;
        font-size: 13px;
        line-height: 16px;
        position: relative;
        box-shadow: 0px 20px 30px 5px rgba(0, 0, 0, 0.25);
    }

    @media (max-width: 520px) {
        :global(html, body) {
            background: transparent;
        }
        main {
            max-width: 100%;
            max-height: 100%;
            background: none;
        }
    }

    @media only screen and (max-height: 680px) {
        :global(body) {
            display: block;
        }
    }
</style>

<main>
    <slot />
</main>
