<script>
    export let text = '';
</script>

<style>
    .container {
        height: 22vh;
        padding: 0 8vw;
    }

    .logo {
        text-align: center;
        padding: 1vh 8vw 4vh;
    }

    header > p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 6vw;
        line-height: 8vw;
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
