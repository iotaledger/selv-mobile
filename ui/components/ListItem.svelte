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
        border-radius: 11vw;
        padding: 2vh 6vw;
    }

    .icon {
        height: 14vw;
        width: 14vw;
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

    .futureCommitment {
        background: #4db6ac;
    }

    .presentCommitment {
        background: #ff7a4c;
    }

    .company {
        background: linear-gradient(180deg, #e97e7e -27.57%, #d3a1e4 183.93%);
    }

    .bank,
    .insurance {
        background: linear-gradient(0deg, #f6bd67 -148.21%, #ffbf9f 90.68%);
    }

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        flex: 1;
        margin-left: 5vw;
        margin-right: 5vw;
    }

    h5 {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 2.7vw;
        line-height: 4vw;
        letter-spacing: 0.06em;
        color: #8593ac;
        text-transform: uppercase;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-weight: 600;
        font-size: 4vw;
        line-height: 7vw;
        color: #131f37;
    }
</style>

<li on:click="{onClick}">
    <span
        class="icon"
        class:personal="{type === 'personal'}"
        class:immunity="{type === 'immunity'}"
        class:visa="{type === 'visa'}"
        class:company="{type === 'company'}"
        class:bank="{type === 'bank'}"
        class:insurance="{type === 'insurance'}"
        class:futureCommitment="{type === 'futureCommitment'}"
        class:presentCommitment="{type === 'presentCommitment'}"
    >
        <slot />
    </span>
    <div>
        <h5>{heading}</h5>
        <h6>{subheading}</h6>
    </div>
    <img src="chevron-right.svg" alt="" />
</li>
