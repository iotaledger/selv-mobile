<script>
    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';
    import { onDestroy } from 'svelte';

    import { goto } from '~/lib/helpers';
    import { activeCredentialForInfo, credentials, modalStatus } from '~/lib/store';

    let credentialNames = setCredentialNames($credentials);

    const unsubscribe = credentials.subscribe((newCredentials) => {
        credentialNames = setCredentialNames(newCredentials);
    });

    function setCredentialNames(_credentials) {
        return Object.keys(_credentials).filter((credentialName) => _credentials[credentialName].data);
    }

    function scan() {
        goto('modal/scan');
    }

    function redirect(credentialName) {
        activeCredentialForInfo.set(credentialName);
        goto('menu/credential-info');
    }

    onDestroy(unsubscribe);

    function getImageSrc(name) {
        if (name === 'personal') {
            return 'identity-authority-logo.png';
        } else if (name === 'immunity') {
            return 'health-authority-logo.png';
        } else if (name === 'bank' || name === 'insurance') {
            return 'sns.png';
        } else if (name === 'company') {
            return 'crown.png';
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
        padding: 6vh 7vw;
        background: url('/circle.png') no-repeat bottom left/60%, url('/rectangle.png') repeat-x top/95%,
            url('/bg-circle-1.png') no-repeat 90% 25%/7%, url('/bg-circle-2.png') no-repeat 16% 26%/3%;
        background-color: var(--bg);
    }

    header {
        margin-top: 4vh;
        margin-bottom: 5vh;
    }

    section {
        flex: 1;
        align-content: space-between;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .logo {
        margin-top: 2vh;
        margin-bottom: 1vh;
        text-align: center;
    }

    .logo > img {
        width: 15vh;
        height: 15vh;
    }

    .list:not(:last-child) {
        margin-bottom: 3vh;
    }

    .list:last-child {
        margin-bottom: 9vh;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 6vw;
        line-height: 8vw;
        text-align: center;
        color: #131f37;
    }

    footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 28vh;
        padding: 0 15vw;
        margin-left: auto;
        margin-right: auto;
        max-width: var(--max-width);
    }

    @media (max-width: 139vw) {
        footer {
            bottom: 5vh;
        }
    }

    .credential-info {
        width: 55%;
    }
</style>

<main>
    <div class="logo">
        <img src="person.png" alt="" />
    </div>

    <header>
        <p>{$credentials.personal.data.firstName} {$credentials.personal.data.lastName}</p>
    </header>
    <section>
        {#each credentialNames as name}
            <div class="list">
                <ListItem
                    type="{name}"
                    onClick="{() => redirect(name)}"
                    heading="{$credentials[name].heading}"
                    subheading="{$credentials[name].subheading}"
                >
                    <img class="credential-info" src="{getImageSrc(name)}" alt="" />
                </ListItem>
            </div>
        {/each}

    </section>

    <footer>
        <Button label="Scan Code" onClick="{scan}">
            <img src="scan.png" alt="" />
        </Button>
    </footer>
</main>
