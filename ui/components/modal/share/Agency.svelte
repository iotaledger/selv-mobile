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
    import { decrypt, parse, encrypt, parseLink, QRLink } from '~/lib/helpers';
    import { Schemas, SchemaNames } from '~/lib/identity/schemas';

    import { credentials, qrLink, socketConnectionState, modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import Socket from '~/lib/socket';

    const { close } = getContext('simple-modal');

    let isProcessingVerifiablePresentations = false;

    function share() {
        processVerifiablePresentations();
    }

    function decline() {
        qrLink.set(null);
        modalStatus.set({ active: false, type: null, subtype: null });
    }

    function processVerifiablePresentations() {
        isProcessingVerifiablePresentations = true;

        retrieveIdentity('did').then((identity) => {
            $qrLink.requestedCredentials
                .reduce((promise, schemaName) => {
                    return promise.then((acc) => {
                        return retrieveCredential(schemaName)
                            .then((credentials) => {
                                acc[schemaName] = credentials;

                                return acc;
                            })
                            .catch(console.log);
                    });
                }, Promise.resolve({}))
                .then((schemaNamesWithCredentials) =>
                    createVerifiablePresentations(
                        identity,
                        Object.keys(schemaNamesWithCredentials).reduce((acc, schemaName) => {
                            if (schemaNamesWithCredentials[schemaName]) {
                                acc[schemaName] = schemaNamesWithCredentials[schemaName];
                            }

                            return acc;
                        }, {}),
                        $qrLink.challenge
                    )
                )
                .then((verifiablePresentations) => {
                    const payload = encrypt($qrLink.password, JSON.stringify(verifiablePresentations));

                    sendVerifiablePresentations($qrLink.channelId, payload);

                    isProcessingVerifiablePresentations = false;
                    modalStatus.set({ active: false, type: null, subtype: null });

                    credentials.update((existingCredentials) =>
                        Object.assign({}, existingCredentials, {
                            visa: Object.assign({}, existingCredentials.visa, {
                                channelId: $qrLink.channelId,
                                password: $qrLink.password
                            })
                        })
                    );

                    qrLink.set(null);
                })
                .catch(console.error);
        });
    }

    function sendVerifiablePresentations(channelId, payload) {
        Socket.socket.emit('verifiablePresentation', { channelId, payload });
    }
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        height: 382px;
        padding: 8px 0px;
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
        margin-bottom: 1px;
    }

    .content {
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .icon {
        height: 50px;
        width: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .icon-authority {
        background: #c995f1;
    }

    .icon-personal {
        background: #7d83ff;
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
    <p>Do you want to share these credentials with Border Agency?</p>
    <div>
        <li>
            <span class:icon-authority="{true}" class="icon">
                <img src="health-authority-logo.png" alt="" />
            </span>

            <div class="content">
                <h5>Public Health Authority</h5>
                <h6>Immunity certificate</h6>
            </div>
        </li>
        <li>
            <span class:icon-personal="{true}" class="icon">
                <img src="crown.png" alt="" />
            </span>

            <div class="content">
                <h5>Home Office</h5>
                <h6>Personal Information</h6>
            </div>
        </li>

    </div>

    <footer>
        <Button loading="{isProcessingVerifiablePresentations}" label="Share credentials" onClick="{share}">
            <img src="check.png" alt="" />
        </Button>
    </footer>
    <p on:click="{decline}">Cancel</p>
</section>
