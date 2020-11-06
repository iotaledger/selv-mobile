<script>
    import { onMount, onDestroy, getContext } from 'svelte';

    import { modalStatus } from '~/lib/store';

    import Presentation from '~/components/modal/Presentation.svelte';

    import Accept from '~/components/modal/Accept.svelte';
    import Share from '~/components/modal/Share.svelte';

    const { close, open } = getContext('simple-modal');

    const unsubscribe = modalStatus.subscribe((status) => {
        if (status.active) {
            if (status.type === 'presentation') {
                open(
                    Presentation,
                    { props: status.props },
                    {
                        styleContent: {
                            background: 'var(--qr-bg)',
                        },
                        styleWindow: {
                            background: 'var(--qr-bg)',
                        },
                    }
                );
            } else if (status.type === 'share') {
                open(Share, { props: status.props });
            } else if (status.type === 'accept') {
                open(Accept, { props: status.props });
            }
        }
    });

    onDestroy(unsubscribe);
</script>
