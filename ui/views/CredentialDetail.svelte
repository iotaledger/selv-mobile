<script>
    import Button from '~/components/Button.svelte';
    import ObjectList from '~/components/ObjectList.svelte';

    import { goto, getImageSrc } from '~/lib/helpers';
    import { modalStatus, storedCredentials } from '~/lib/store';

    import { __IOS__ } from '~/lib/platform';

    function share() {
        modalStatus.set({ active: true, type: 'presentation', props: { id: idFromUrl } });
    }

    function deleteCredential() {
        console.log('delete');
        storedCredentials.update((prev) => prev.filter((credential) => credential.credentialDocument.id !== idFromUrl));
        goBack();
    }
    function goBack() {
        goto('home');
    }

    const idFromUrl = new URL('http://' + window.location.hash.substr(1)).searchParams.get('id');

    const credential = $storedCredentials.find((credential) => credential.credentialDocument.id === idFromUrl);
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background-color: var(--bg);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        position: relative;
    }

    header {
        margin-bottom: 5vh;
    }

    .wrapper {
        text-align: center;
        padding-top: 2vh;
        min-height: 36vh;
    }

    .wrapper-ios {
        min-height: calc(env(safe-area-inset-top) + 36vh);
        min-height: calc(constant(safe-area-inset-top) + 36vh);
    }

    .header {
        position: absolute;
        top: 2vh;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
    }

    .header-ios {
        top: calc(env(safe-area-inset-top) + 2vh);
        top: calc(constant(safe-area-inset-top) + 2vh);
    }

    header > p:nth-child(1) {
        margin-top: 2vh;
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 3vw;
        line-height: 4vw;
        color: #fff;
        text-transform: uppercase;
    }

    header > p:nth-child(2) {
        margin-top: 2vh;
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 6vw;
        line-height: 7vw;
        color: #fff;
    }

    section {
        margin: 0 7vw;
    }

    footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 28vh;
        padding: 0 20vw;
        margin-left: auto;
        margin-right: auto;
        max-width: var(--max-width);
    }

    @media (max-width: 139vw) {
        footer {
            bottom: 5vh;
        }
    }

    .chevron {
        z-index: 1;
        position: fixed;
        left: 7vw;
        top: 7vh;
    }

    .chevron-ios {
        top: calc(env(safe-area-inset-top) + 5px);
        top: calc(constant(safe-area-inset-top) + 5px);
    }

    .credential-logo {
        width: 15%;
    }
</style>

<main>
    <div style="background-color: {credential.enrichment.theme}" class="wrapper" class:wrapper-ios="{__IOS__}">
        <img class="chevron" class:chevron-ios="{__IOS__}" on:click="{goBack}" src="chevron-left.svg" alt="" />

        <div class="header" class:header-ios="{__IOS__}">
            <img class="credential-logo" src="{getImageSrc(credential.enrichment.logo)}" alt="" />
            <header>
                <p>{credential.enrichment.issuerLabel}</p>
                <p>{credential.enrichment.credentialLabel}</p>
                <button on:click="{deleteCredential}">Delete</button>
            </header>

            <section>
                <ObjectList object="{credential.credentialDocument.credentialSubject}" />
            </section>
        </div>

        <footer>
            <Button label="Share" onClick="{share}"><img src="share.png" alt="" /></Button>
        </footer>
    </div>
</main>
