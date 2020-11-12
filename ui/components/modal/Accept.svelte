<script>
    import { getImageSrc, isVerifiableCredential, generateRandomId } from '~/lib/helpers';

    import { modalStatus, storedCredentials, currentCredentialToAccept } from '~/lib/store';

    import Button from '~/components/Button.svelte';
    import ThemableListItem from '~/components/ThemableListItem.svelte';

    let isCreatingCredential = false;

    let credential: Credential;

    if (isVerifiableCredential($currentCredentialToAccept.credentialDocument)) {
        credential = $currentCredentialToAccept;
    }

    console.log(credential, $currentCredentialToAccept);

    function accept() {
        if (credential) {
            isCreatingCredential = true;
            storedCredentials.update((prev) => {
                isCreatingCredential = false;
                return [...prev, { credentialDocument: { ...credential.credentialDocument }, id: generateRandomId() }];
            });
            currentCredentialToAccept.set(null);
            modalStatus.set({ active: false, type: null });
        }
    }

    function decline() {
        modalStatus.set({ active: false, type: null });
    }
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        padding: 1vh 0vh;
    }

    p:nth-child(1) {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 6vw;
        line-height: 8vw;
        text-align: center;
        color: #131f37;
        padding: 0 11vw;
    }

    p:last-child {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 5vw;
        line-height: 5vw;
        color: #8593ac;
        text-align: center;
        letter-spacing: 0.04em;
    }

    footer {
        padding: 0 5vw;
    }

    footer > p {
        padding: 3vh 0;
    }

    @media (max-width: 85vw) {
        p:nth-child(1) {
            padding: 0 8vw;
        }
    }

    .credentials {
        margin: 3vh 0;
    }

    .credential-info {
        width: 55%;
    }
</style>

<section>
    <p>Accept credential?</p>

    <span class="credentials">
        <ThemableListItem
            heading="{credential.enrichment.issuerLabel || ''}"
            subheading="{credential.enrichment.credentialLabel || ''}"
            themeColor="{credential.enrichment.theme || ''}"
        >
            <img class="credential-info" src="{getImageSrc(credential.enrichment.logo || '')}" alt="" />
        </ThemableListItem>
    </span>

    <footer>
        <Button loading="{isCreatingCredential}" label="Accept credential" onClick="{accept}">
            <img src="check.png" alt="" />
        </Button>
        <p on:click="{decline}">Decline</p>
    </footer>
</section>
