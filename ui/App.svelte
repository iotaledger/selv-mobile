<script>
    import { onMount } from 'svelte';

    import Notification from '~/components/Notification.svelte';
    import Route from '~/components/Route.svelte';
    import Theme from '~/components/Theme.svelte';
    import Content from '~/components/modal/Content.svelte';
    import Modal from '~/components/modal/Index.svelte';
    import Socket from '~/components/Socket.svelte';

    import Home from '~/views/Home.svelte';
    import Landing from '~/views/Landing.svelte';
    import Password from '~/views/Password.svelte';
    import CredentialInfo from '~/views/CredentialInfo.svelte';
    import CredentialDetail from '~/views/CredentialDetail.svelte';
    import PresentationDetail from '~/views/PresentationDetail.svelte';
    import Name from '~/views/Name.svelte';
    import Splash from '~/views/Splash.svelte';
    import Scan from '~/views/Scan.svelte';

    import { SPLASH_SCREEN_TIMEOUT } from '~/lib/config';
    import { __WEB__ } from '~/lib/platform';
    import { hasSetupAccount, listOfCredentials, storedCredentials } from '~/lib/store';
    import Keychain from '~/lib/keychain';

    import { retrieveCredentials } from '~/lib/identity';

    let displayHome = false;
    let splash = true;

    onMount(() => {
        setTimeout(() => {
            splash = false;
        }, SPLASH_SCREEN_TIMEOUT);

        if (!$hasSetupAccount) {
            return Keychain.clear();
        }

        retrieveCredentials($listOfCredentials).then((credentials) => {
            displayHome = true;
            storedCredentials.set(credentials.map((credential) => ({ credentialDocument: credential })));
        });
    });
</script>

<Theme>
    <Socket />
    <Notification />
    {#if splash && __WEB__}
        <Route route="">
            <Splash />
        </Route>
    {:else}
        <Route route="" entry>
            {#if !$hasSetupAccount}
                <Landing />
            {:else if displayHome}
                <Home />
            {/if}
        </Route>
        <Route route="onboarding/landing" home>
            <Landing />
        </Route>
        <Route route="onboarding/name" onboarding>
            <Name />
        </Route>
        <Route route="onboarding/password" onboarding>
            <Password />
        </Route>
        <Route route="onboarding/home" onboarding>
            <Home />
        </Route>
        <Route route="home" home>
            <Home />
        </Route>
        <Route route="menu/credential-info" menu>
            <CredentialInfo />
        </Route>
        <Route route="menu/credential-detail" menu>
            <CredentialDetail />
        </Route>
        <Route route="menu/presentation-detail" menu>
            <PresentationDetail />
        </Route>
        <Route route="modal/scan" modal>
            <Scan />
        </Route>
    {/if}
    <Modal>
        <Content />
    </Modal>
</Theme>
