<script>
    import { onMount } from 'svelte';

    import Route from '~/components/Route';
    import Theme from '~/components/Theme';
    import Content from '~/components/modal/Content';
    import Modal from '~/components/modal/Index';
    import Socket from '~/components/Socket';

    import Home from '~/views/Home';
    import Landing from '~/views/Landing';
    import Password from '~/views/Password';
    import CredentialInfo from '~/views/CredentialInfo';
    import ShareCredentials from '~/views/ShareCredentials';
    import Name from '~/views/Name';
    import Scan from '~/views/Scan';
    import Splash from '~/views/Splash';

    import { SPLASH_SCREEN_TIMEOUT } from '~/lib/config';
    import { credentials } from '~/lib/store';
    import { preparePersonalInformation, prepareImmunityInformation, prepareVisaInformation } from '~/lib/helpers';

    import { retrieveCredential } from '~/lib/identity';

    import { SchemaNames } from '~/lib/identity/schemas';

    let splash = true;
    let hasSetupAccount = false;

    onMount(() => {
        setTimeout(() => {
            splash = false;
        }, SPLASH_SCREEN_TIMEOUT);

        Promise.all([
            retrieveCredential(SchemaNames.ADDRESS),
            retrieveCredential(SchemaNames.PERSONAL_DATA),
            retrieveCredential(SchemaNames.TEST_RESULT),
            retrieveCredential(SchemaNames.VISA_APPLICATION)
        ]).then((result) => {
            const [addressCredential, personalDataCredential, testResultCredential, visaApplicationCredential] = result;

            if (addressCredential && personalDataCredential) {
                hasSetupAccount = true;
                const personalInfo = preparePersonalInformation(
                    addressCredential.credentialSubject,
                    personalDataCredential.credentialSubject
                );

                credentials.update((existingCredentials) =>
                    Object.assign({}, existingCredentials, {
                        personal: Object.assign({}, existingCredentials.personal, {
                            data: personalInfo
                        })
                    })
                );
            }

            if (testResultCredential) {
                credentials.update((existingCredentials) =>
                    Object.assign({}, existingCredentials, {
                        immunity: Object.assign({}, existingCredentials.immunity, {
                            data: prepareImmunityInformation(testResultCredential.credentialSubject)
                        })
                    })
                );
            }

            if (visaApplicationCredential) {
                credentials.update((existingCredentials) =>
                    Object.assign({}, existingCredentials, {
                        visa: Object.assign({}, existingCredentials.visa, {
                            data: prepareVisaInformation(visaApplicationCredential.credentialSubject)
                        })
                    })
                );
            }
        });
    });
</script>

<Theme>
    <Socket />
    {#if splash}
        <Route route="">
            <Splash />
        </Route>
    {:else}
        <Route route="" primary>
            {#if hasSetupAccount}
                <Home />
            {:else}
                <Landing />
            {/if}
        </Route>
        <Route route="home">
            <Home />
        </Route>
        <Route route="name">
            <Name />
        </Route>
        <Route route="password">
            <Password />
        </Route>
        <Route route="scan">
            <Scan />
        </Route>
        <Route route="credential-info">
            <CredentialInfo />
        </Route>
        <Route route="qr">
            <ShareCredentials />
        </Route>
    {/if}
    <Modal>
        <Content />
    </Modal>
</Theme>
