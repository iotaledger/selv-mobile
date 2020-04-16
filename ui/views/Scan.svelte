<script>
    import Scanner from '~/components/Scanner';

    import { goto, parseLink } from '~/lib/helpers';
    import { qrLink } from '~/lib/store';

    function handleScannerData(event) {
        const parsedLink = parseLink(event.detail);

        if (parsedLink) {
            qrLink.set(parsedLink);
        }

        goBack();
    }

    function goBack() {
        goto('home');
    }
</script>

<style>
    main {
        height: 100%;
        background-color: var(--bg);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    header {
        background: linear-gradient(149.28deg, #1b65d0 18.55%, #1961c9 85.04%);
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    header > p {
        display: block;
        flex-grow: 1;
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 20px;
        letter-spacing: 0.04em;
        color: #ffffff;
        margin-right: 0 auto;
    }

    div {
        height: 100%;
    }
</style>

<main>
    <header>
        <img on:click="{goBack}" src="chevron-left.svg" alt="" />
        <p>QR SCANNER</p>
    </header>

    <div>
        <Scanner on:message="{handleScannerData}" />
    </div>
</main>
