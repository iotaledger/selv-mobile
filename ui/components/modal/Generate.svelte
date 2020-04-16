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
        background: linear-gradient(0deg, #92d0f3 -57.14%, #913dd1 207.14%);
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
        font-style: normal;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.06em;
        color: #8593ac;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        line-height: 24px;
        color: #131f37;
    }
</style>

<section id="wrapper">
    <img class="top" src="popup-icon.png" width="50px" alt="" />
    <p>Share credential</p>
    <li>
        <span class="icon">
            <img src="crown.png" alt="" />
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
