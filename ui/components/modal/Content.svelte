<script>
    import { onMount, onDestroy, getContext } from 'svelte';

    import { modalStatus } from '~/lib/store';

    import Scan from '~/components/modal/Scan';
    import Presentation from '~/components/modal/Presentation';

    import Share from '~/components/modal/Share';

    import Accept from '~/components/modal/Accept';

    const { close, open } = getContext('simple-modal');

    const unsubscribe = modalStatus.subscribe((status) => {
        if (status.active) {
            if (status.type === 'scan') {
                open(Scan, { props: status.props }, { background: 'var(--qr-bg)' });
            } else if (status.type === 'presentation') {
                open(Presentation, { props: status.props }, { background: 'var(--qr-bg)' });
            } else if (status.type === 'share') {
                open(Share, { props: status.props });
            } else if (status.type === 'accept') {
                open(Accept, { props: status.props });
            }
        }
    });

    onDestroy(unsubscribe);
</script>
