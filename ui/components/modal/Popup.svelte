<script>
    import { qrLink, modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import Generate from '~/components/modal/Generate';

    import ShareWithCompany from '~/components/modal/share/Company';
    import ShareWithBank from '~/components/modal/share/Bank';
    import ShareWithInsurance from '~/components/modal/share/Insurance';

    import AcceptCompanyCredentials from '~/components/modal/accept/Company';
    import AcceptBankCredentials from '~/components/modal/accept/Bank';
    import AcceptInsuranceCredentials from '~/components/modal/accept/Insurance';

    export let props;
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        height: 100%;
    }
</style>

<section>
    {#if $modalStatus.type === 'generate'}
        <Generate {props} />
    {:else if $modalStatus.type === 'share'}
        {#if $modalStatus.subtype === 'company'}
            <ShareWithCompany {props} />
        {:else if $modalStatus.subtype === 'bank'}
            <ShareWithBank {props} />
        {:else if $modalStatus.subtype === 'insurance'}
            <ShareWithInsurance {props} />
        {/if}
    {:else if $modalStatus.type === 'accept'}
        {#if props.schemaName.toLowerCase() === 'company'}
            <AcceptCompanyCredentials {props} />
        {:else if props.schemaName.toLowerCase() === 'bankaccount'}
            <AcceptBankCredentials {props} />
        {:else if props.schemaName.toLowerCase() === 'insurance'}
            <AcceptInsuranceCredentials {props} />
        {/if}
    {/if}
</section>
