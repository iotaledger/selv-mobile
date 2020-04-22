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
                    subheading: 'Immunity Certificate',
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
        height: 45vh;
    }

    p:nth-child(1) {
        font-family: 'Metropolis', sans-serif;
        font-weight: bold;
        font-size: 6vw;
        line-height: 6vw;
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

    li {
        display: flex;
        background: #ffffff;
        box-shadow: 0px 4px 12px rgba(217, 225, 238, 0.3);
        padding: 2vh 6vh;
    }

    div {
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
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
        height: 4vh;
        width: 8vh;
    }

    h5 {
        font-family: 'Inter', sans-serif;
        font-weight: 1000;
        font-size: 3vw;
        letter-spacing: 0.06em;
        color: #8593ac;
        text-transform: uppercase;
    }

    h6 {
        font-family: 'Metropolis', sans-serif;
        font-weight: 600;
        font-size: 4vw;
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
</style>

<section>
    <p>{content[customSchemaName].heading}</p>

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

    <footer>
        <Button loading="{isCreatingCredential}" label="{content[customSchemaName].label}" onClick="{accept}">
            <img src="check.png" alt="" />
        </Button>
    </footer>
    <p on:click="{decline}">{content[customSchemaName].closeText}</p>

</section>
