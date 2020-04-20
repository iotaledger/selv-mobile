<script>
    import { onMount, onDestroy, getContext } from 'svelte';

    import { modalStatus } from '~/lib/store';

    import Generate from '~/components/modal/Generate';

    import ShareWithOrganisation from '~/components/modal/share/Organisation';
    import ShareWithEmployer from '~/components/modal/share/Employer';
    import ShareWithAgency from '~/components/modal/share/Agency';

    import AcceptImmunityCredentials from '~/components/modal/accept/Immunity';
    import AcceptVisaCredentials from '~/components/modal/accept/Visa';

    const { close, open } = getContext('simple-modal');

    const unsubscribe = modalStatus.subscribe((status) => {
        if (status.active) {
            console.log('Status', status);
            if (status.type === 'generate') {
                open(Generate, { props: status.props });
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
