<script>
    import ValidationStatus from '~/components/ValidationStatus.svelte';
    import ObjectList from '~/components/ObjectList.svelte';

    import { onMount } from 'svelte';

    import { goto, getImageSrc } from '~/lib/helpers';
    import { currentPresentation } from '~/lib/store';

    import { __IOS__ } from '~/lib/platform';

    import { VerifiablePresentation, DecodeProofDocument, SchemaManager } from '@iota/identity';
    import { AddressSchema } from '../lib/identity/schemas';

    let valid: boolean;
    let loading = true;

    onMount(async () => {
        console.log($currentPresentation);

        const issuers = $currentPresentation.presentationDocument.verifiableCredential.map(
            (verifiableCredential) => verifiableCredential.proof
        );
        console.log(issuers);
        const resolvedIssuers = await Promise.all(
            issuers.map((issuer) => DecodeProofDocument(issuer, 'https://nodes.devnet.iota.org'))
        );
        console.log(resolvedIssuers);
        const issuersDIDs = resolvedIssuers.map((resolvedIssuer) => resolvedIssuer.issuer.GetDID());
        console.log(issuersDIDs);

        const decodedProofDocument = await DecodeProofDocument(
            $currentPresentation.presentationDocument.proof,
            'https://nodes.devnet.iota.org'
        );
        console.log(decodedProofDocument);

        const verifiablePresentation = await VerifiablePresentation.DecodeFromJSON(
            $currentPresentation.presentationDocument,
            'https://nodes.devnet.iota.org',
            decodedProofDocument
        );

        issuersDIDs.map((issuerDID) => {
            console.log(SchemaManager.GetInstance().GetSchema('Address'));
            if (!SchemaManager.GetInstance().GetSchema('Address')) {
                SchemaManager.GetInstance().AddSchema('Address', AddressSchema);
            }
            SchemaManager.GetInstance().GetSchema('Address').AddTrustedDID(issuerDID);
            SchemaManager.GetInstance().GetSchema('DIDAuthenticationCredential').AddTrustedDID(issuerDID);
        });
        console.log(verifiablePresentation);

        // this will error if not valid
        await verifiablePresentation.Verify('https://nodes.devnet.iota.org');
        valid = true;
        loading = false;
    });

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
    .validation-status-wrapper {
        /* TODO: super arbitrary, prob need to rework header */
        margin-top: 13vh;
        margin-bottom: 5vh;
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
    <div style="background-color: {$currentPresentation.enrichment.theme}" class="wrapper" class:wrapper-ios="{__IOS__}">
        <img class="chevron" class:chevron-ios="{__IOS__}" on:click="{goBack}" src="chevron-left.svg" alt="" />

        <div class="header" class:header-ios="{__IOS__}">
            <div class="header" class:header-ios="{__IOS__}">
                <img class="credential-logo" src="{getImageSrc($currentPresentation.enrichment.logo)}" alt="" />
                <header>
                    <p>{$currentPresentation.enrichment.issuerLabel}</p>
                    <p>{$currentPresentation.enrichment.credentialLabel}</p>
                </header>

                <section class="validation-status-wrapper">
                    <ValidationStatus loading="{loading}" valid="{valid}" />
                </section>

                <section>
                    {#each $currentPresentation.presentationDocument.verifiableCredential as credential}
                        <ObjectList object="{credential.credentialSubject}" />
                    {/each}
                </section>
            </div>
        </div>
    </div>
</main>
