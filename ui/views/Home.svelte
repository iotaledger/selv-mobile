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
        background: url('/circle.png') fixed no-repeat bottom left/60%, url('/rectangle.png') fixed repeat-x top/95%,
            url('/bg-circle-1.png') fixed no-repeat 90% 25%/7%, url('/bg-circle-2.png') fixed no-repeat 16% 26%/3%;
        background-color: var(--bg);
    }

    header {
        margin-top: 25px;
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

    .logo > img {
        width: 100px;
        height: 100px;
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

    .credential-info {
        height: 25px;
        width: 30px;
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
