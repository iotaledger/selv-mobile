<script>
    import { onMount, onDestroy, getContext } from 'svelte';

    import { modalStatus } from '~/lib/store';

    import Scan from '~/components/modal/Scan';
    import Presentation from '~/components/modal/Presentation';

    import ShareWithOrganisation from '~/components/modal/share/Organisation';
    import ShareWithEmployer from '~/components/modal/share/Employer';
    import ShareWithAgency from '~/components/modal/share/Agency';

    import AcceptImmunityCredentials from '~/components/modal/accept/Immunity';
    import AcceptVisaCredentials from '~/components/modal/accept/Visa';

    const { close, open } = getContext('simple-modal');

    const unsubscribe = modalStatus.subscribe((status) => {
        if (status.active) {
            if (status.type === 'scan') {
                open(Scan, { props: status.props }, { background: 'var(--qr-bg)' });
            } else if (status.type === 'presentation') {
                open(Presentation, { props: status.props }, { background: 'var(--qr-bg)' });
            } else if (status.type === 'share') {
                if (status.subtype === 'organisation') {
                    open(ShareWithOrganisation, { props: status.props });
                } else if (status.subtype === 'employer') {
                    open(ShareWithEmployer, { props: status.props });
                } else if (status.subtype === 'agency') {
                    open(ShareWithAgency, { props: status.props });
                }
            } else if (status.type === 'accept') {
                if (status.props.schemaName.toLowerCase() === 'testresult') {
                    open(AcceptImmunityCredentials, { props: status.props });
                } else if (status.props.schemaName.toLowerCase() === 'visaapplication') {
                    open(AcceptVisaCredentials, { props: status.props });
                }
            }
        }
    });

    onDestroy(unsubscribe);
</script>
