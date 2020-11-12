<script>
    import QRCode from 'qrcode-svg';
    import { onMount } from 'svelte';

    import { detectSwipeGesture } from '~/lib/helpers';

    import { qrCode, modalStatus, storedCredentials } from '~/lib/store';

    import { createVerifiablePresentation, retrieveIdentity } from '~/lib/identity';

    onMount(() => {
        detectSwipeGesture('wrapper', 'swipedown', () => goBack());
    });

    console.log($modalStatus.props);

    const credential = $storedCredentials.find((credential) => credential.id === $modalStatus.props.id);
    const schema = credential.credentialDocument.type[1];
    const challenge = Date.now();

    console.log(credential, schema, challenge);

    retrieveIdentity('did').then((identity) => {
        createVerifiablePresentation(identity, [credential.credentialDocument], challenge, true).then(
            (verifiablePresentations) => {
                const strigifiedPresentation = JSON.stringify(verifiablePresentations);
                const qrData = strigifiedPresentation;
                const deviceHeight = document.documentElement.clientHeight;
                console.log(qrData);
                qrCode.set(
                    new QRCode({
                        content: qrData,
                        color: '#000000',
                        //join: true,
                        height: deviceHeight * 0.3,
                        width: deviceHeight * 0.3,
                        ecl: 'L',
                    }).svg()
                );
            }
        );
    });

    function goBack() {
        modalStatus.set({ active: false, type: null });
    }
</script>

<style>
    main {
        height: 100%;
        padding: 3vh 8vw;
        background-color: var(--qr-bg);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    section > p {
        font-family: 'Inter', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 3vw;
        line-height: 4vw;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #8593ac;
    }

    .qr {
        margin-top: 4vh;
        min-height: 50vh;
        width: 100%;
        background: #ffffff;
        box-shadow: 0px 4px 12px #1658b8;
        border-radius: 4vw;
        display: flex;
        padding: 3vh 7vw 2.5vh 7vw;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    .icon {
        position: absolute;
        left: 7vw;
        top: 3vh;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: 600;
        font-size: 5vw;
        line-height: 7vw;
        text-align: center;
        color: #051923;
    }
</style>

<main id="wrapper">
    <img class="icon" on:click="{goBack}" src="chevron-left.svg" alt="" />

    <section class="qr">
        <h6>Share your {credential.credentialDocument.type[1]} credential</h6>
        <p>Valid until {new Date(challenge + 5 * 60 * 1000).toLocaleString()}</p>

        <div contenteditable="false" bind:innerHTML="{$qrCode}"></div>
    </section>
</main>
