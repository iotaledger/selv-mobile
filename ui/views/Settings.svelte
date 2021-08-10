<script>
    import { goto } from '~/lib/helpers';
    import { __IOS__ } from '~/lib/platform';

    import { clearIdentity } from '~/lib/identity';
    import Button from '~/components/Button';

    function clear() {
        clearIdentity().then(() => {
            goto('onboarding/landing');
        });
    }

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

    section {
        padding: 6vh 7vw;
    }

    img {
        position: absolute;
        left: 5vw;
    }
    .delete-icon {
        margin-right: 5px;
        position: static;
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
        <p>Settings</p>
    </header>
    <section>
        <Button onClick="{clear}" label="Delete everything"><img class="delete-icon" src="delete_forever.svg" alt="" /></Button>
    </section>
</main>
