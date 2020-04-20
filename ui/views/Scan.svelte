<script>
    import { Capacitor } from '@capacitor/core';
    import Scanner from '~/components/Scanner';

    import { goto, parseLink } from '~/lib/helpers';
    import { qrLink } from '~/lib/store';

    function handleScannerData(event) {
        const parsedLink = parseLink(event.detail);

        if (parsedLink) {
            qrLink.set(parsedLink);
        }

        goBack();
    }

    function goBack() {
        goto('home');
    }
</script>

<style>
    main {
        height: 100%;
        overflow: hidden;
    }

    header {
        background: linear-gradient(149.28deg, #1b65d0 18.55%, #1961c9 85.04%);
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    header.ios {
        padding: calc(env(safe-area-inset-top) + 5px) 0px 15px 0px;
        padding: calc(constant(safe-area-inset-top) + 5px) 0px 15px 0px;
    }

    img {
        position: absolute;
        left: 20px;
    }

    header > p {
        flex-grow: 1;
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 20px;
        letter-spacing: 0.04em;
        color: #ffffff;
        text-transform: uppercase;
    }
</style>

<main>
    <header class:ios="{Capacitor.getPlatform() === 'ios'}">
        <img on:click="{goBack}" src="chevron-left.svg" alt="" />
        <p>QR Scanner</p>
    </header>

    <Scanner on:message="{handleScannerData}" />
</main>
