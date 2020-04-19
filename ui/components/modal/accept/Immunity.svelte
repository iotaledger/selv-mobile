<script>
    import { getContext } from 'svelte';

    import {
        createCredential,
        createVerifiablePresentations,
        Identity,
        retrieveIdentity,
        createIdentity,
        storeIdentity,
        storeCredential,
        retrieveCredential
    } from '~/lib/identity';
    import { prepareImmunityInformation, decrypt, parse, encrypt, parseLink, QRLink } from '~/lib/helpers';
    import { Schemas, SchemaNames } from '~/lib/identity/schemas';

    import { credentials, qrLink, socketConnectionState, modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import Socket from '~/lib/socket';

    export let props;
    let isCreatingCredential = false;

    function accept() {
        processCustomCredential(props.schemaName, props.payload);
    }

    function decline() {
        modalStatus.set({ active: false, type: null });
    }

    function processCustomCredential(schemaName, data) {
        const payload = Object.assign({}, data);
        isCreatingCredential = true;

        retrieveIdentity()
            .then((identity) => {
                payload.AccountNumber = '9'.repeat(11);

                createCredential(identity, schemaName, payload).then((credential) =>
                    storeCredential(schemaName, credential).then(() => {
                        const password = $credentials.immunity.password;
                        const channelId = $credentials.immunity.channelId;

                        Socket.socket.emit('createCompany', { payload });

                        Socket.socket.emit('createCredentialConfirmation', {
                            channelId: channelId,
                            payload: encrypt(password, JSON.stringify({ status: 'success', payload }))
                        });

                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                immunity: Object.assign({}, existingCredentials.immunity, {
                                    data: prepareImmunityInformation(credential.credentialSubject),
                                    password: null,
                                    channelId: null
                                })
                            })
                        );

                        modalStatus.set({ active: false, type: null });
                        isCreatingCredential = false;
                    })
                );
            })
            .catch(console.error);
    }
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        padding: 8px 0px;
        height: 300px;
    }

    p:nth-child(1) {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 21px;
        line-height: 24px;
        text-align: center;
        color: #131f37;
        padding: 0 40px;
    }

    p:last-child {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 18px;
        line-height: 20px;
        color: #8593ac;
        text-align: center;
        letter-spacing: 0.04em;
    }

    footer {
        padding: 0px 20px;
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
        background: #13c4a3;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .icon > img {
        height: 25px;
        width: 30px;
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
</style>

<section>
    <p>Accept certificate?</p>
    <li>
        <span class="icon">
            <img src="health-authority-logo.png" alt="" />
        </span>

        <div>
            <h5>Public Health Authority</h5>
            <h6>Immunity Certificate</h6>
        </div>
    </li>

    <footer>
        <Button loading="{isCreatingCredential}" label="Accept certificate" onClick="{accept}">
            <img src="check.png" alt="" />
        </Button>
    </footer>
    <p on:click="{decline}">Decline</p>

</section>
