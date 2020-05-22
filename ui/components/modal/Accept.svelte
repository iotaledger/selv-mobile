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
    import { prepareImmunityInformation, prepareVisaInformation, decrypt, parse, encrypt, parseLink } from '~/lib/helpers';
    import { Schemas, SchemaNames } from '~/lib/identity/schemas';

    import { credentials, modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import Socket from '~/lib/socket';

    export let props;
    let isCreatingCredential = false;

    const content = {
        immunity: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'Public Health Authority',
                    subheading: 'Health Certificate',
                    icon: 'health-authority-logo.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        },
        visa: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'Foreign Border Agency',
                    subheading: 'Travel Visa',
                    icon: 'border-agency-logo.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        }
    };

    function schemaNameToContentKeyMapper(schemaName) {
        if (schemaName === 'TestResult') {
            return 'immunity';
        }

        return 'visa';
    }

    const customSchemaName = schemaNameToContentKeyMapper(props.schemaName);

    function accept() {
        processCustomCredential(props.schemaName, props.payload);
    }

    function decline() {
        let channelId = $credentials.immunity.channelId;

        if (customSchemaName === 'visa') {
            channelId = $credentials.visa.channelId;
        }

        Socket.socket.emit('rejectCredentials', { channelId, payload: 'The request to accept credentials was declined.' });

        modalStatus.set({ active: false, type: null });
    }

    function processCustomCredential(schemaName, data) {
        const payload = Object.assign({}, data);

        isCreatingCredential = true;

        retrieveIdentity()
            .then((identity) => {
                createCredential(identity, schemaName, payload).then((credential) =>
                    storeCredential(schemaName, credential).then(() => {
                        let password = $credentials.immunity.password;
                        let channelId = $credentials.immunity.channelId;

                        if (customSchemaName === 'visa') {
                            password = $credentials.visa.password;
                            channelId = $credentials.visa.channelId;
                        }

                        Socket.socket.emit('createCompany', { payload });

                        Socket.socket.emit('createCredentialConfirmation', {
                            channelId: channelId,
                            payload: encrypt(password, JSON.stringify({ status: 'success', payload }))
                        });

                        if (customSchemaName === 'immunity') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    immunity: Object.assign({}, existingCredentials.immunity, {
                                        data: prepareImmunityInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        } else if (customSchemaName === 'visa') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    visa: Object.assign({}, existingCredentials.visa, {
                                        data: prepareVisaInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        }

                        modalStatus.set({ active: false, type: null });
                        isCreatingCredential = false;
                    })
                );
            })
            .catch(() => {
                isCreatingCredential = false;
            });
    }
</script>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        padding: 1vh 0vh;
    }

    p:nth-child(1) {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 6vw;
        line-height: 8vw;
        text-align: center;
        color: #131f37;
        padding: 0 11vw;
    }

    p:last-child {
        font-family: 'Metropolis', sans-serif;
        font-style: normal;
        font-weight: bold;
        font-size: 5vw;
        line-height: 5vw;
        color: #8593ac;
        text-align: center;
        letter-spacing: 0.04em;
    }

    footer {
        padding: 0 5vw;
    }

    footer > p {
        padding: 3vh 0;
    }

    li {
        display: flex;
        background: #ffffff;
        box-shadow: 0px 4px 12px rgba(217, 225, 238, 0.3);
        padding: 2vh 11vw;
    }

    div {
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        width: 50vw;
        align-items: flex-start;
        justify-content: center;
    }

    .icon {
        height: 7.5vh;
        width: 7.5vh;
        background: #13c4a3;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .icon-immunity {
        background: #13c4a3;
    }

    .icon-visa {
        background: #102e68;
    }

    .icon > img {
        width: 55%;
    }

    h5 {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 3vw;
        line-height: 4vw;
        letter-spacing: 0.06em;
        color: #8593ac;
        text-transform: uppercase;
        width: 50vw;
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

    @media (max-width: 85vw) {
        p:nth-child(1) {
            padding: 0 8vw;
        }

        li {
            padding: 2 8vw;
        }
    }

    .credentials {
        margin: 3vh 0;
    }
</style>

<section>
    <p>{content[customSchemaName].heading}</p>

    <span class="credentials">
        {#each content[customSchemaName].listItems as object}
            <li>
                <span
                    class="icon"
                    class:icon-immunity="{customSchemaName === 'immunity'}"
                    class:icon-visa="{customSchemaName === 'visa'}"
                >
                    <img src="{object.icon}" alt="" />
                </span>

                <div>
                    <h5>{object.heading}</h5>
                    <h6>{object.subheading}</h6>
                </div>
            </li>
        {/each}
    </span>

    <footer>
        <Button loading="{isCreatingCredential}" label="{content[customSchemaName].label}" onClick="{accept}">
            <img src="check.png" alt="" />
        </Button>
        <p on:click="{decline}">{content[customSchemaName].closeText}</p>
    </footer>
</section>
