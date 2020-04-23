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
    import { decrypt, parse, encrypt, parseLink } from '~/lib/helpers';
    import { Schemas, SchemaNames } from '~/lib/identity/schemas';

    import { credentials, modalStatus } from '~/lib/store';

    import Button from '~/components/Button';
    import ListItem from '~/components/ListItem';

    import Socket from '~/lib/socket';

    let isProcessingVerifiablePresentations = false;
    export let props;

    const content = {
        healthAuthority: {
            heading: 'Do you want to share this credential with “National Health Authority”?',
            label: 'Share credential',
            closeText: 'Cancel'
        },
        employer: {
            heading: 'Do you want to share these credentials with your employer?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        agency: {
            heading: 'Do you want to share these credentials with Border Agency?',
            label: 'Share credentials',
            closeText: 'Cancel'
        }
    };

    function share() {
        processVerifiablePresentations();
    }

    function decline() {
        modalStatus.set({ active: false, type: null });
    }

    function processVerifiablePresentations() {
        isProcessingVerifiablePresentations = true;

        retrieveIdentity('did').then((identity) => {
            props.requestedCredentials
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
                        props.challenge
                    )
                )
                .then((verifiablePresentations) => {
                    const payload = encrypt(props.password, JSON.stringify(verifiablePresentations));

                    sendVerifiablePresentations(props.channelId, payload);

                    isProcessingVerifiablePresentations = false;

                    modalStatus.set({ active: false, type: null });

                    let nextCredential = 'immunity';

                    if (props.shareWith === 'healthAuthority') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                immunity: Object.assign({}, existingCredentials.immunity, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'agency') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                visa: Object.assign({}, existingCredentials.visa, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    }
                })
                .catch(() => {
                    isProcessingVerifiablePresentations = false;
                });
        });
    }

    function sendVerifiablePresentations(channelId, payload) {
        Socket.socket.emit('verifiablePresentation', { channelId, payload });
    }

    function prepareCredentialsContent() {
        return props.requestedCredentials.reduce((acc, credential) => {
            if (credential === 'PersonalData') {
                acc.push({
                    alias: 'personal',
                    heading: 'Home Office',
                    subheading: 'Personal Information',
                    icon: 'identity-authority-logo.png'
                });
            } else if (credential === 'TestResult') {
                acc.push({
                    alias: 'authority',
                    heading: 'Public Health Authority',
                    subheading: 'Immunity certificate',
                    icon: 'health-authority-logo.png'
                });
            }

            return acc;
        }, []);
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
        padding: 0 40px;
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
        padding: 0px 5vw;
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
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .icon-personal {
        background: #7d83ff;
    }

    .icon-authority {
        background: #c995f1;
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
            padding: 2vh 8vw;
        }
    }

    .credentials {
        margin: 3vh 0;
    }
</style>

<section>
    <p>{content[props.shareWith].heading}</p>

    <span class="credentials">
        {#each prepareCredentialsContent() as object}
            <li>
                <span
                    class:icon-personal="{object.alias === 'personal'}"
                    class:icon-authority="{object.alias === 'authority'}"
                    class="icon"
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
        <Button loading="{isProcessingVerifiablePresentations}" label="{content[props.shareWith].label}" onClick="{share}">
            <img src="check.png" alt="" />
        </Button>
        <p on:click="{decline}">{content[props.shareWith].closeText}</p>
    </footer>
</section>
