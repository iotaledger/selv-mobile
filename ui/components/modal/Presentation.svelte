<script>
    import QRCode from 'qrcode-svg';
    import { onDestroy, onMount, setContext, getContext } from 'svelte';

    import { goto, detectSwipeGesture } from '~/lib/helpers';

    import { credentials, qrCode, modalStatus, storedCredentials } from '~/lib/store';

    import { createVerifiablePresentations, retrieveIdentity } from '~/lib/identity';

    onMount(() => {
        detectSwipeGesture('wrapper', 'swipedown', () => goBack());
    });

    console.log($modalStatus.props);

    const credential = $storedCredentials.find((credential) => credential.credentialDocument.id === $modalStatus.props.id);
    const shema = credential.credentialDocument.type[1];
    const challenge = Date.now();

    console.log(credential, shema, challenge);

    retrieveIdentity('did').then((identity) => {
        createVerifiablePresentations(identity, { [shema]: credential.credentialDocument }, challenge).then(
            (verifiablePresentations) => {
                console.log(verifiablePresentations);
                const deviceHeight = document.documentElement.clientHeight;
                console.log(verifiablePresentations);
                const content = JSON.stringify(verifiablePresentations);
                console.log(content);
                qrCode.set(
                    new QRCode({
                        content,
                        color: '#13C4A3',
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

    header {
        margin: 5vh 0vh;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 7.5vw;
        line-height: 8vw;
        text-align: center;
        color: #ffffff;
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

    .avatar {
        height: 17vh;
        width: 17vh;
    }
</style>

<main id="wrapper">
    <img class="icon" on:click="{goBack}" src="chevron-left.svg" alt="" />

    <img class="avatar" src="person.png" alt="" />

    <header>
        <p>TODO TODO</p>
    </header>

    <section class="qr">
        <h6>Your {credential.credentialDocument.type[1]} certificate</h6>
        <p>Valid until {new Date(challenge + 5 * 60 * 1000).toLocaleString()}</p>

        <div contenteditable="false" bind:innerHTML="{$qrCode}"></div>
    </section>
</main>
