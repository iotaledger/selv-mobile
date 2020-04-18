<script>
    import Button from '~/components/Button';
    import Header from '~/components/Header';
    import ListItem from '~/components/ListItem';
    import { onDestroy, onMount } from 'svelte';

    import { goto } from '~/lib/helpers';
    import { activeCredentialForInfo, credentials, modalStatus, qrLink, socketConnectionState } from '~/lib/store';

    let credentialNames = setCredentialNames($credentials);

    const unsubscribe = credentials.subscribe((newCredentials) => {
        credentialNames = setCredentialNames(newCredentials);
    });

    function setCredentialNames(_credentials) {
        return Object.keys(_credentials).filter((credentialName) => _credentials[credentialName].data);
    }

    function save() {
        goto('scan');
    }

    function redirect(credentialName) {
        activeCredentialForInfo.set(credentialName);
        goto('credential-info');
    }

    onMount(() => {
        // Check if qr is scanned
        if ($qrLink) {
            let subtype = 'organisation';

            if (
                $qrLink.requestedCredentials.includes('TestResult') &&
                !$qrLink.requestedCredentials.includes('VisaApplication')
            ) {
                subtype = 'employer';
            } else if (
                $qrLink.requestedCredentials.includes('TestResult') &&
                $qrLink.requestedCredentials.includes('VisaApplication')
            ) {
                subtype = 'agency';
            }

            socketConnectionState.set('registerMobileClient');
            modalStatus.set({ active: true, type: 'share', subtype });
        }
    });

    onDestroy(unsubscribe);

    function getImageSrc(name) {
        if (name === 'personal') {
            return 'crown.png';
        } else if (name === 'immunity') {
            return 'health-authority-logo.png';
        }

        return 'border-agency-logo.png';
    }
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        padding: 40px 25px;
        background: url('/circle.png') fixed no-repeat bottom left, url('/dots.png') fixed no-repeat bottom right,
            url('/rectangle.png') fixed repeat-x top, url('/bg-circle-1.png') fixed no-repeat 90% 25%,
            url('/bg-circle-2.png') fixed no-repeat 20% 26%;
        background-color: var(--bg);
    }

    header {
        margin-bottom: 30px;
    }

    section {
        flex: 1;
        align-content: space-between;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .logo {
        margin-top: 15px;
        margin-bottom: 5px;
        text-align: center;
    }

    .list:not(:last-child) {
        margin-bottom: 20px;
    }

    .list:last-child {
        margin-bottom: 60px;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 24px;
        line-height: 30px;
        text-align: center;
        color: #131f37;
    }

    footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 190px;
        padding: 0 55px;
        margin-left: auto;
        margin-right: auto;
        max-width: var(--max-width);
    }

    @media (max-width: 520px) {
        footer {
            bottom: 30px;
        }
    }
</style>

<main>
    <Header name="{$credentials.personal.data.firstName + ' ' + $credentials.personal.data.lastName}" />

    <section>
        {#each credentialNames as name}
            <div class="list">
                <ListItem
                    type="{name}"
                    onClick="{() => redirect(name)}"
                    heading="{$credentials[name].heading}"
                    subheading="{$credentials[name].subheading}"
                >
                    <img src="{getImageSrc(name)}" alt="" />
                </ListItem>
            </div>
        {/each}

    </section>

    <footer>
        <Button label="Scan Code" onClick="{save}">
            <img src="scan.png" alt="" />
        </Button>
    </footer>
</main>
