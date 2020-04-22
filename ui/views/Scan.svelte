<script>
    import Scanner from '~/components/Scanner';

    import { goto, parseLink } from '~/lib/helpers';
    import { socketConnectionState, modalStatus } from '~/lib/store';
    import { __IOS__ } from '~/lib/platform';

    function handleScannerData(event) {
        const parsedLink = parseLink(event.detail);

        if (parsedLink) {
            goBack();

            socketConnectionState.set({ state: 'registerMobileClient', payload: parsedLink });
            modalStatus.set({ active: true, type: 'share', props: parsedLink });
        }
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
        display: flex;
        align-items: center;
        justify-content: center;
    }

    header.ios {
        padding: calc(env(safe-area-inset-top) + 1vh) 0 2vw 0;
        padding: calc(constant(safe-area-inset-top) + 1vh) 0 2vw 0;
    }

    img {
        position: absolute;
        left: 5vw;
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
        font-size: 5vw;
        line-height: 5vw;
        letter-spacing: 0.04em;
        color: #ffffff;
        text-transform: uppercase;
    }
</style>

<main>
    <header class:ios="{__IOS__}">
        <img on:click="{goBack}" src="chevron-left.svg" alt="" />
        <p>QR Scanner</p>
    </header>
    <Scanner on:message="{handleScannerData}" />
</main>
