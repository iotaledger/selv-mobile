<script>
    import { onMount } from 'svelte';
    import Hammer from 'hammerjs';

    import { modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import { goto } from '~/lib/helpers';

    onMount(() => {
        if (window.matchMedia('(pointer: coarse)').matches) {
            const hammer = new Hammer(document.getElementById('wrapper'));
            hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

            hammer.on('swipedown', () => {
                modalStatus.set({ active: false, type: null });
            });
        }
    });

    function generate() {
        modalStatus.set({ active: false, type: null });

        goto('qr');
    }
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        height: 260px;
    }

    p {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 21px;
        line-height: 24px;
        text-align: center;
        color: #131f37;
    }

    footer {
        padding: 0px 60px;
    }

    li {
        display: flex;
        background: #ffffff;
        box-shadow: 0px 4px 12px rgba(217, 225, 238, 0.3);
        padding: 12px 24px;
    }

    div {
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .icon {
        height: 50px;
        width: 50px;
        background: #7d83ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .top {
        margin: 0 auto;
    }

    h5 {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 11px;
        letter-spacing: 0.06em;
        color: #8593ac;
        text-transform: uppercase;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-weight: 600;
        font-size: 16px;
        color: #131f37;
    }

    .credential-icon {
        height: 25px;
        width: 30px;
    }
</style>

<section id="wrapper">
    <p>Share credential</p>
    <li>
        <span class="icon">
            <img class="credential-icon" src="crown.png" alt="" />
        </span>

        <div>
            <h5>HOME OFFICE</h5>
            <h6>Personal Information</h6>
        </div>
    </li>

    <footer>
        <Button label="Generate QR" onClick="{generate}">
            <img src="qr.png" alt="" />
        </Button>
    </footer>
</section>
