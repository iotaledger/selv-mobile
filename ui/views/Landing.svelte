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
            header: 'Selv helps you manage your digital selv',
            content:
                'A safe space for your personal information, only accessible by you. Selv is powered by the neutral, free and decentralized network IOTA',
            footer: 'Next'
        },
        {
            header: 'Your data, your ownership',
            content: 'Your data is stored only on your phone. Currently, no backup options are available.',
            footer: 'Next'
        },
        {
            header: 'You control where your data flows',
            content:
                'Selv is all about controlling your personal data, not locking it up. You can decide who you share your data with by providing consent.',
            footer: 'Continue'
        }
    ];

    function onNext() {
        if ($landingIndex === info.length - 1) {
            goto('onboarding/name');
        } else {
            back = false;
            landingIndex.update(x => x + 1);
        }
    }

    function onBack() {
        if ($landingIndex !== 0) {
            back = true;
            landingIndex.update(x => x - 1);
        }
    }

    function getInAnimation() {
        if ($landingIndex > 0 && $landingIndex < info.length - 1) {
            return { x: back ? -360 : 360}
        }
        return { x: $landingIndex === 0 ? -360 : 360 }
    }

    function getOutAnimation() {
        if ($landingIndex > 0 && $landingIndex < info.length - 1) {
            return { x: back ? 360 : -360}
        }
        return { x: $landingIndex === 0 ? 360 : -360 }
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
        padding: 40px 0px;
        background: var(--bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .content {
        position: absolute;
        top: 30vh;
        text-align: center;
        justify-content: flex-start;
        align-items: center;
        height: 350px;
        width: 100%;
    }

    .content > img {
        mix-blend-mode: multiply;
        width: 200px;
        height: 200px;
    }

    .dots {
        text-align: center;
        padding: 20px 0px;
    }

    span {
        height: 9px;
        width: 9px;
        background-color: #c4d0e3;
        border-radius: 50%;
        display: inline-block;
        margin-right: 4px;
    }

    span.active {
        height: 10px;
        width: 10px;
        background: #8593ac;
    }

    .info {
        font-family: 'Inter', sans-serif;
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 22px;
        color: #6f7a8d;
        text-align: center;
        padding: 0px 20px;
    }

    footer {
        padding: 0px 30px;
    }
</style>

<main id="wrapper">
    <Header text="{info[$landingIndex].header}" />

    {#each [$landingIndex] as count (count)}
        <div class="content" in:fly="{mounted ? { ...getInAnimation(), duration: 400, opacity: 0 } : false}" out:fly="{{...getOutAnimation(), duration: 400, opacity: 0 }}">
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

    <footer>
        <Button label="{info[$landingIndex].footer}" onClick="{onNext}" />
    </footer>
</main>
