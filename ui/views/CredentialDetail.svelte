<script>
    import Button from '~/components/Button.svelte';
    import ObjectList from '~/components/ObjectList.svelte';

    import { goto, getImageSrc } from '~/lib/helpers';
    import { modalStatus, storedCredentials } from '~/lib/store';

    import { prepareCredentialForDisplay } from '~/lib/identity';

    import { __IOS__ } from '~/lib/platform';

    const idFromUrl = new URL('http://' + window.location.hash.substr(1)).searchParams.get('id');

    const credential = $storedCredentials.find((credential) => credential.id === idFromUrl);

    const preparedCredentialDocument = prepareCredentialForDisplay(credential.credentialDocument);

    function share() {
        modalStatus.set({ active: true, type: 'presentation', props: { id: idFromUrl } });
    }

    function deleteCredential() {
        console.log('delete');
        storedCredentials.update((prev) => prev.filter((credential) => credential.id !== idFromUrl));
        goBack();
    }

    function goBack() {
        goto('home');
    }
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

    header > p {
        margin-top: 2vh;
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 3vw;
        line-height: 4vw;
        color: #fff;
    }
    header > p:nth-child(1) {
        text-transform: uppercase;
    }

    header > p:nth-child(2) {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 6vw;
        line-height: 7vw;
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

    .delete {
        z-index: 1;
        position: fixed;
        right: 7vw;
        top: 7vh;
        width: 25px;
        background: none;
        fill: white;
        margin-top: -6px;
        box-shadow: none;
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
        <button class="delete" on:click="{deleteCredential}"><svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                x="0px"
                y="0px"
                viewBox="0 0 60.167 60.167"
                style="enable-background:new 0 0 60.167 60.167;"
                xml:space="preserve"
            >
                <path
                    d="M54.5,11.667H39.88V3.91c0-2.156-1.754-3.91-3.91-3.91H24.196c-2.156,0-3.91,1.754-3.91,3.91v7.756H5.667  c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.042v40.5c0,3.309,2.691,6,6,6h32.75c3.309,0,6-2.691,6-6v-40.5H54.5c0.552,0,1-0.448,1-1  S55.052,11.667,54.5,11.667z M22.286,3.91c0-1.053,0.857-1.91,1.91-1.91H35.97c1.053,0,1.91,0.857,1.91,1.91v7.756H22.286V3.91z   M50.458,54.167c0,2.206-1.794,4-4,4h-32.75c-2.206,0-4-1.794-4-4v-40.5h40.75V54.167z M38.255,46.153V22.847c0-0.552,0.448-1,1-1  s1,0.448,1,1v23.306c0,0.552-0.448,1-1,1S38.255,46.706,38.255,46.153z M29.083,46.153V22.847c0-0.552,0.448-1,1-1s1,0.448,1,1  v23.306c0,0.552-0.448,1-1,1S29.083,46.706,29.083,46.153z M19.911,46.153V22.847c0-0.552,0.448-1,1-1s1,0.448,1,1v23.306  c0,0.552-0.448,1-1,1S19.911,46.706,19.911,46.153z"
                ></path>
            </svg></button>

        <div class="header" class:header-ios="{__IOS__}">
            <img class="credential-logo" src="{getImageSrc(credential.enrichment.logo)}" alt="" />
            <header>
                <p>{credential.enrichment.issuerLabel}</p>
                <p>{credential.enrichment.credentialLabel}</p>
                <p>{new Date(preparedCredentialDocument.issuanceDate).toLocaleString()}</p>
            </header>

            <section>
                <ObjectList object="{preparedCredentialDocument.credentialSubject}" />
            </section>
        </div>

        <footer>
            <Button label="Share" onClick="{share}"><img src="share.png" alt="" /></Button>
        </footer>
    </div>
</main>
