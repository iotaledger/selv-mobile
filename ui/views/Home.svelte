<script>
    import { onDestroy } from 'svelte';
    import Button from '~/components/Button.svelte';
    import ThemableListItem from '~/components/ThemableListItem.svelte';

    import { goto, getImageSrc } from '~/lib/helpers';
    import { credentials, storedCredentials } from '~/lib/store';

    function scan() {
        goto('modal/scan');
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
    <div class="logo"><img src="person.png" alt="" /></div>

    <header>
        <p>TODO TODO</p>
    </header>
    <section>
        {#each $storedCredentials as credential}
            <div class="list">
                <ThemableListItem
                    onClick="{() => goto('menu/credential-detail', { id: credential.credentialDocument.id })}"
                    heading="{credential.enrichment ? credential.enrichment.issuerLabel : ''}"
                    subheading="{credential.enrichment ? credential.enrichment.credentialLabel : ''}"
                    themeColor="{credential.enrichment ? credential.enrichment.theme : ''}"
                >
                    <img
                        class="credential-info"
                        src="{getImageSrc(credential.enrichment ? credential.enrichment.logo : '')}"
                        alt=""
                    />
                </ThemableListItem>
            </div>
        {/each}
    </section>

    <footer>
        <Button label="Scan Code" onClick="{scan}"><img src="scan.png" alt="" /></Button>
    </footer>
</main>
