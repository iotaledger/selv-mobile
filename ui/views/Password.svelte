<script>
    import Button from '~/components/Button';
    import Header from '~/components/Header';
    import TextField from '~/components/TextField';

    import { goto } from '~/lib/helpers';

    let password = '';

    function save() {
        goto('onboarding/name');
    }
</script>

<style>
    main {
        height: 100%;
        padding: 3vh 13vw;
        background: url('/circle.png') fixed no-repeat bottom left;
        background-color: var(--bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .content {
        text-align: center;
        background-color: #e5e5e5;
    }

    .content > img {
        mix-blend-mode: multiply;
    }

    footer {
        padding: 0px 8vw;
    }
</style>

<main>
    <Header text="Set your password" />

    <div class="content">
        <img src="login.png" alt="" />
    </div>

    <TextField value="{password}" placeholder="Your password" />

    <footer>
        <Button label="Save Password" onClick="{save}" />
    </footer>
</main>
