<script>
    import { onMount } from 'svelte';
    import Button from '~/components/Button';

    import { goto } from '~/lib/helpers';
    import { activeCredentialForInfo, credentials, modalStatus } from '~/lib/store';

    const credentialInfo = Object.keys($credentials[$activeCredentialForInfo].data).map((key) => ({
        key: [key.replace(/([a-z](?=[A-Z]))/g, '$1 ')],
        value: $credentials[$activeCredentialForInfo].data[key]
    }));

    let logo = 'crown';

    onMount(() => {
        if ($activeCredentialForInfo === 'immunity') {
            logo = 'health-authority-logo';
        } else if ($activeCredentialForInfo === 'visa') {
            logo = 'border-agency-logo';
        }
    });

    function share() {
        modalStatus.set({ active: true, type: 'generate' });
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
        margin-bottom: 30px;
    }

    .logo {
        text-align: center;
        padding-top: 20px;
        min-height: 200px;
    }

    .logo-personal {
        background: #7d83ff;
    }

    .logo-immunity {
        background: #1b65d0;
    }

    .logo-visa {
        background: #102e68;
    }

    .small-logo {
        position: absolute;
        top: 35px;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
    }

    header > p:nth-child(1) {
        margin-top: 13px;
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 10px;
        line-height: 16px;
        color: #fff;
        text-transform: uppercase;
    }

    header > p:nth-child(2) {
        margin-top: 10px;
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 22px;
        line-height: 24px;
        color: #fff;
    }

    ul {
        background: #fff;
        margin: 20px 25px;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        list-style-type: none;
        text-align: left;
        overflow: auto;

        -webkit-overflow-scrolling: touch;
    }

    li {
        padding: 10px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    li:nth-last-child(n + 2) {
        border-bottom: 1px solid #f1f4fa;
    }

    li > p {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 10px;
        line-height: 16px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #8593ac;
    }

    li > span {
        font-family: 'Metropolis Regular', sans-serif;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        color: #131f37;
    }

    footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 190px;
        padding: 0 75px;
        margin-left: auto;
        margin-right: auto;
        max-width: var(--max-width);
    }

    @media (max-width: 520px) {
        footer {
            bottom: 30px;
        }
    }

    .icon {
        display: flex;
        padding-left: 25px;
    }

    .credential-logo {
        height: 38px;
        width: 45px;
    }
</style>

<main>
    <div
        class:logo-personal="{$activeCredentialForInfo === 'personal'}"
        class:logo-immunity="{$activeCredentialForInfo === 'immunity'}"
        class:logo-visa="{$activeCredentialForInfo === 'visa'}"
        class="logo"
    >
        <img class="icon" on:click="{goBack}" src="chevron-left.svg" alt="" />

        <div class="small-logo">
            <img class="credential-logo" src="{`${logo}.png`}" alt="" />
            <header>
                <p>{$credentials[$activeCredentialForInfo].heading}</p>
                <p>{$credentials[$activeCredentialForInfo].subheading}</p>
            </header>
            <ul>
                {#each credentialInfo as object}
                    <li>
                        <p>{object.key}</p>
                        <span>{object.value}</span>
                    </li>
                {/each}
            </ul>
        </div>
    </div>

    <footer>
        <Button label="Share" onClick="{share}">
            <img src="share.png" alt="" />
        </Button>
    </footer>
</main>
