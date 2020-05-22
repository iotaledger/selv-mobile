<script>
    import Button from '~/components/Button';
    import Header from '~/components/Header';
    import { goto } from '~/lib/helpers';
    import { landingIndex } from '~/lib/store';

    import { onMount } from 'svelte';
    import Hammer from 'hammerjs';

    import { fly } from 'svelte/transition';

    let mounted;
    let back = $landingIndex > 0;

    const info = [
        {
            header: 'Selv stores your personal credentials',
            content:
                'A secure store for your personal data, only accessible to you. Selv is powered by the open, free and decentralized network IOTA.',
            footer: 'Next'
        },
        {
            header: 'Your data, your ownership',
            content: 'Your data is stored locally on your device, restoring privacy to your data.',
            footer: 'Next'
        },
        {
            header: 'You control access to your data',
            content:
                'Selv is all about controlling your personal data, not locking it up. You decide who you share your data with.',
            footer: 'Continue'
        }
    ];

    function onNext() {
        if ($landingIndex === info.length - 1) {
            goto('onboarding/name');
        } else {
            back = false;
            landingIndex.update((x) => x + 1);
        }
    }

    function onBack() {
        if ($landingIndex !== 0) {
            back = true;
            landingIndex.update((x) => x - 1);
        }
    }

    function getInAnimation() {
        if ($landingIndex > 0 && $landingIndex < info.length - 1) {
            return { x: back ? -360 : 360 };
        }
        return { x: $landingIndex === 0 ? -360 : 360 };
    }

    function getOutAnimation() {
        if ($landingIndex > 0 && $landingIndex < info.length - 1) {
            return { x: back ? 360 : -360 };
        }
        return { x: $landingIndex === 0 ? 360 : -360 };
    }

    onMount(() => {
        mounted = true;
        if (window.matchMedia('(pointer: coarse)').matches) {
            const hammer = new Hammer(document.getElementById('wrapper'));
            hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
            hammer.on('swipeleft', () => onNext());
            hammer.on('swiperight', () => onBack());
        }
    });
</script>

<style>
    main {
        height: 100%;
        padding: 6vh 0px;
        background: var(--bg);
        display: flex;
        flex-direction: column;
        display: flex;
        flex: 1;
    }

    .content {
        position: fixed;
        text-align: center;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    .content > img {
        mix-blend-mode: multiply;
        width: 30vh;
        height: 30vh;
    }

    .dots {
        text-align: center;
        justify-content: center;
        padding: 2.5vh 0;
    }

    span {
        height: 1.3vh;
        width: 1.3vh;
        background-color: #c4d0e3;
        border-radius: 50%;
        display: inline-block;
        margin-right: 1vh;
    }

    span.active {
        height: 1.4vh;
        width: 1.4vh;
        background: #8593ac;
    }

    .info {
        font-family: 'Inter', sans-serif;
        font-style: normal;
        font-weight: normal;
        font-size: 2.08vh;
        line-height: 3.3vh;
        color: #6f7a8d;
        text-align: center;
        padding: 0px 3vw;
    }

    footer {
        padding: 0px 8vw;
    }

    .headerContainer {
        display: flex;
        flex: 0.5;
    }

    .contentContainer {
        display: flex;
        flex: 1;
    }

    .footerContainer {
        display: flex;
        align-self: flex-end;
        width: 100%;
    }
</style>

<main id="wrapper">
    <div class="headerContainer">
        <Header text="{info[$landingIndex].header}" />
    </div>
    <div class="contentContainer">
        {#each [$landingIndex] as count (count)}
            <div
                class="content"
                in:fly="{mounted ? { ...getInAnimation(), duration: 400, opacity: 0 } : false}"
                out:fly="{{ ...getOutAnimation(), duration: 400, opacity: 0 }}"
            >
                <img src="{`landing-${$landingIndex + 1}.png`}" alt="" />
                <div class="dots">
                    {#each Array(3)
                        .fill()
                        .map((_, i) => i) as idx}
                        <span class:active="{idx === $landingIndex}"></span>
                    {/each}
                </div>
                <p class="info">{info[$landingIndex].content}</p>
            </div>
        {/each}
    </div>
    <footer class="footerContainer">
        <Button label="{info[$landingIndex].footer}" onClick="{onNext}" />
    </footer>
</main>
