<script>
    export let onClick;
    export let heading;
    export let subheading;
    export let type = 'personal';
</script>

<style>
    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        box-shadow: 0px 4px 12px rgba(217, 225, 238, 0.3);
        border-radius: 43px;
        padding: 12px 24px;
    }

    .icon {
        height: 53px;
        width: 53px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .personal {
        background: #7d83ff;
    }

    .immunity {
        background: #13c4a3;
    }

    .visa {
        background: #102e68;
    }

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        flex: 1;
        margin-left: 20px;
        margin-right: 20px;
    }

    p {
        font-family: 'Metropolis', sans-serif;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        color: #131f37;
    }

    h5 {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 10px;
        line-height: 16px;
        letter-spacing: 0.06em;
        color: #8593ac;
        text-transform: uppercase;
    }
</style>

<li on:click="{onClick}">
    <span
        class="icon"
        class:personal="{type === 'personal'}"
        class:immunity="{type === 'immunity'}"
        class:visa="{type === 'visa'}"
    >
        <slot />
    </span>
    <div>
        <h5>{heading}</h5>
        <p>{subheading}</p>
    </div>
    <img src="chevron-right.svg" alt="" />
</li>
