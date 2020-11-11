<script>
    import Scanner from '~/components/Scanner.svelte';

    import { goto, parse, isChannelInfo, isVerifiablePresentation, isVerifiableCredential } from '~/lib/helpers';
    import { socketConnectionState, modalStatus, error, currentPresentation, currentCredentialToAccept } from '~/lib/store';
    import { __IOS__ } from '~/lib/platform';

    async function handleScannerData(event) {
        const parsedData = JSON.parse('{"@context":"https://www.w3.org/2018/credentials/v1","type":"VerifiablePresentation","verifiableCredential":[{"@context":"https://www.w3.org/2018/credentials/v1","type":["VerifiableCredential","DIDAuthenticationCredential"],"credentialSubject":{"DID":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4","challengeNonce":1605108456935},"issuer":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4","issuanceDate":"2020-11-11T15:27:37Z","proof":{"type":"JcsEd25519Signature2020","verificationMethod":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4#authentication","created":"2020-11-11T15:27:37Z","signatureValue":"29Gqu6fFs3DmeBp4WTBqv875tDedYRc77H8VhksdWG9L6fLcp2h4GyKKqq3wB934rCygdnRWwoPECYSnoPmZZjU71uDwcj3s6wv9c6sZgxBzwxqoLhipWzZ2TSWMFBW1fEx8"}},{"@context":"https://www.w3.org/2018/credentials/v1","type":["VerifiableCredential","ContactDetails"],"credentialSubject":{"id":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4","UserContacts":{"Email":"marcelina.tentije@example.com","Phone":"(253)-735-7573"}},"issuer":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4","issuanceDate":"2020-11-11T11:21:16Z","proof":{"type":"JcsEd25519Signature2020","verificationMethod":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4#authentication","created":"2020-11-11T11:21:16Z","signatureValue":"2H3vUCzbS9CiAWdpqyGUVstGH1x9r6arVpVkkjaaUXtoKi1sruaTE6R6V6bRRKENqPqPtNeK8Nh7YA7c6ubjj8SourEu863wifAsGhsPfML1FSggciVrBTRr4jP2dc5HCLCo"}}],"holder":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4","proof":{"type":"JcsEd25519Signature2020","verificationMethod":"did:iota:main:DUh6ZeDLPNHqAeP1cGPzoRUAqZoE991U25Fy8VeDxih4#authentication","created":"2020-11-11T15:27:37Z","signatureValue":"26yvCVmo3WhPREBTDeyfuA7SnnJztvvN6ZpDu3fsCgeeLh26jzCmf7RsaDPn7ihz189HUJZopJM6N3hVH9LMHomsBLJpqUthu8Px9wrX19RQYs366j6jTDrgqQp1VhvdXEza"}}');//parse(event.detail);

        if (!parsedData) goBack();

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
