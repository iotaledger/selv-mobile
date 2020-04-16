<script>
    import Button from '~/components/Button';
    import { goto } from '~/lib/helpers';

    let pageIndex = 0;

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
        if (pageIndex === info.length - 1) {
            goto('name');
        } else {
            pageIndex = pageIndex + 1;
        }
    }
</script>

<style>
    main {
        height: 100%;
        padding: 40px;
        background: var(--bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .logo {
        text-align: center;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 24px;
        line-height: 30px;
        text-align: center;
        color: #131f37;
    }

    .content {
        text-align: center;
        background-color: var(--bg);
    }

    .content > img {
        mix-blend-mode: multiply;
    }

    .dots {
        text-align: center;
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
        font-size: 15px;
        line-height: 22px;
        color: #6f7a8d;
        text-align: center;
    }

    footer {
        padding: 0px 30px;
    }
</style>

<main>
    <div class="logo">
        <img src="selv-header.svg" alt="" />
    </div>

    <header>
        <p>{info[pageIndex].header}</p>
    </header>

    <div class="content">
        <img src="{`landing-${pageIndex + 1}.png`}" alt="" />
    </div>

    <div class="dots">
        {#each Array(3)
            .fill()
            .map((_, i) => i) as idx}
            <span class:active="{idx === pageIndex}"></span>
        {/each}
    </div>

    <p class="info">{info[pageIndex].content}</p>

    <footer>
        <Button label="{info[pageIndex].footer}" onClick="{onNext}" />
    </footer>
</main>
