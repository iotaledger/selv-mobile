<script>
    import Button from '~/components/Button';
    import TextField from '~/components/TextField';

    import { goto } from '~/lib/helpers';

    let password = '';

    function save() {
        goto('name');
    }
</script>

<style>
    main {
        height: 100%;
        padding: 20px 50px;
        background: url('/circle.png') fixed no-repeat bottom left, url('/dots.png') fixed no-repeat right;
        background-color: var(--bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .logo {
        text-align: center;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 24px;
        line-height: 30px;
        text-align: center;
        color: #131f37;
    }

    .content {
        text-align: center;
        background-color: #e5e5e5;
    }

    .content > img {
        mix-blend-mode: multiply;
    }

    footer {
        padding: 0px 30px;
    }
</style>

<main>
    <div class="logo">
        <img src="selv-header.svg" alt="" />
    </div>

    <header>
        <p>Set your password</p>
    </header>

    <div class="content">
        <img src="login.png" alt="" />
    </div>

    <TextField value="{password}" placeholder="Your password" />

    <footer>
        <Button label="Save Password" onClick="{save}" />
    </footer>
</main>
