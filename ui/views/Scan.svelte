<script>
    import pako from 'pako';

    import Scanner from '~/components/Scanner.svelte';

    import { goto, parse, isChannelInfo, isVerifiablePresentation, isVerifiableCredential } from '~/lib/helpers';
    import { socketConnectionState, modalStatus, error, currentPresentation, currentCredentialToAccept } from '~/lib/store';
    import { __IOS__ } from '~/lib/platform';

    async function handleScannerData(event) {
        let parsedData = parse(event.detail);

        if (!parsedData) return goBack();

        if (parsedData.cp) {
            parsedData = parse(pako.inflate(parsedData.cp, { to: 'string' }));
        }

        if (isChannelInfo(parsedData)) {
            socketConnectionState.set({ state: 'registerMobileClient', payload: parsedData });
            goBack();
            return setTimeout(() => modalStatus.set({ active: true, type: 'share', props: parsedData }), 300);
        } else if (isVerifiablePresentation(parsedData)) {
            currentPresentation.set({ presentationDocument: parsedData });
            goto('menu/presentation-detail');
        } else if (isVerifiableCredential(parsedData)) {
            currentCredentialToAccept.set({ credentialDocument: parsedData });
            modalStatus.set({ active: true, type: 'accept' });
            goBack();
        } else if (event.detail.includes('qr-redirect')) {
            goBack();
            return error.set('You already have the Selv app downloaded');
        } else {
            error.set('Invalid QR Code');
            goBack();
        }
    }

    window.handleScannerData = handleScannerData;

    function goBack() {
        goto('home');
    }
</script>

<style>
    main {
        height: 100vh;
        overflow: hidden;
    }

    header {
        background: linear-gradient(149.28deg, #1b65d0 18.55%, #1961c9 85.04%);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 15vh;
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
    }
</style>

<main>
    <header class:ios="{__IOS__}">
        <img on:click="{goBack}" src="chevron-left.svg" alt="" />
        <p>QR Scanner</p>
    </header>
    <Scanner on:message="{handleScannerData}" />
</main>
