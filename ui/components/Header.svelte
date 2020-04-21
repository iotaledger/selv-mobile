<script>
    export let text = '';
</script>

<style>
    .container {
        height: 150px;
    }

    .logo {
        text-align: center;
        padding: 5px 30px 25px;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 24px;
        line-height: 30px;
        text-align: center;
        color: #131f37;
    }
</style>

<div class="container">
    <div class="logo">
        <img src="selv-header.svg" alt="" />
    </div>

    <header>
        <p>{text}</p>
    </header>
</div>
