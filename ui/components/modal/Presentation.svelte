<script>
    import Hammer from 'hammerjs';
    import QRCode from 'qrcode-svg';
    import { onDestroy, onMount, setContext, getContext } from 'svelte';

    import { goto } from '~/lib/helpers';

    import { activeCredentialForInfo, credentials, qrCode, modalStatus } from '~/lib/store';

    onMount(() => {
        qrCode.set(
            new QRCode({
                content: JSON.stringify($credentials.personal.data),
                color: '#13C4A3'
            }).svg()
        );

        if (window.matchMedia('(pointer: coarse)').matches) {
            const hammer = new Hammer(document.getElementById('wrapper'));
            hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

            hammer.on('swiperight', () => {
                goBack();
            });
        }
    });

    function goBack() {
        modalStatus.set({ active: false, type: null });
    }
</script>

<style>
    main {
        height: 100%;
        padding: 20px 30px;
        background-color: var(--qr-bg);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    header {
        margin: 30px 0px;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 28px;
        line-height: 30px;
        text-align: center;
        color: #ffffff;
    }

    section > p {
        font-family: 'Inter', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 11px;
        line-height: 16px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #8593ac;
        margin-bottom: 12px;
    }

    .qr {
        min-height: 330px;
        width: 100%;
        background: #ffffff;
        box-shadow: 0px 4px 12px #1658b8;
        border-radius: 16px;
        display: flex;
        padding: 40px 25px 25px 25px;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    .icon {
        position: absolute;
        left: 25px;
        top: 20px;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        line-height: 26px;
        text-align: center;
        color: #051923;
    }

    .avatar {
        height: 114px;
        width: 114px;
    }
</style>

<main id="wrapper">
    <img class="icon" on:click="{goBack}" src="chevron-left.svg" alt="" />

    <img class="avatar" src="person.png" alt="" />

    <header>
        <p>{$credentials.personal.data.firstName} {$credentials.personal.data.lastName}</p>
    </header>

    <section class="qr">
        <h6>Your {$activeCredentialForInfo} credentials</h6>
        <p>Valid until April 18, 2020</p>

        <div contenteditable="true" bind:innerHTML="{$qrCode}"></div>
    </section>
</main>
