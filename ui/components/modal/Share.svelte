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
        },
        company: {
            heading: 'Do you want to share this credential with Company House?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        bank: {
            heading: 'Do you want to share this credential with SNS Bank?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        insurance: {
            heading: 'Do you want to share this credential with SNS Bank?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        ancestorRegistry: {
            heading: 'Do you want to share this credential with “Good Ancestor Registry“?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        futureCommitment: {
            heading: 'Do you want to share this credential with “The Far Future Foundation“?',
            label: 'Share credentials',
            closeText: 'Cancel'
        },
        presentCommitment: {
            heading: 'Do you want to share this credential with “The Now Foundation“?',
            label: 'Share credentials',
            closeText: 'Cancel'
        }
    };

    function share() {
        if (isProcessingVerifiablePresentations) {
            return;
        }
        isProcessingVerifiablePresentations = true;
        setTimeout(() => {
            processVerifiablePresentations();
        }, 2000);
    }

    function decline() {
        modalStatus.set({ active: false, type: null });
    }

    function processVerifiablePresentations() {
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

                    if (props.shareWith === 'company') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                company: Object.assign({}, existingCredentials.company, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'bank') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                bank: Object.assign({}, existingCredentials.bank, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'insurance') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                insurance: Object.assign({}, existingCredentials.insurance, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'ancestorRegistry') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                ancestorRegistry: Object.assign({}, existingCredentials.ancestorRegistry, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'futureCommitment') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                futureCommitment: Object.assign({}, existingCredentials.futureCommitment, {
                                    channelId: props.channelId,
                                    password: props.password
                                })
                            })
                        );
                    } else if (props.shareWith === 'presentCommitment') {
                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                presentCommitment: Object.assign({}, existingCredentials.presentCommitment, {
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
        Socket.getActiveSocket(props.url).emit('verifiablePresentation', { channelId, payload });
    }

    function prepareCredentialsContent() {
        return props.requestedCredentials.reduce((acc, credential) => {
            if (credential === 'PersonalData') {
                acc.push({
                    alias: 'personal',
                    heading: 'Home Office',
                    subheading: 'My Identity',
                    icon: 'government-logo.png'
                });
            } else if (credential === 'TestResult') {
                acc.push({
                    alias: 'authority',
                    heading: 'Public Health Authority',
                    subheading: 'Health certificate',
                    icon: 'health-authority-logo.png'
                });
            } else if (credential === 'Company') {
                acc.push({
                    alias: 'company',
                    heading: 'Home Office',
                    subheading: 'Company Details',
                    icon: 'government-logo.png'
                });
            } else if (credential === 'BankAccount') {
                acc.push({
                    alias: 'bank',
                    heading: 'Company House',
                    subheading: 'Company Details',
                    icon: 'sns.png'
                });
            } else if (credential === 'Insurance') {
                acc.push({
                    alias: 'company',
                    heading: 'Insurance',
                    subheading: 'Insruance Details',
                    icon: 'sns.png'
                });
            } else if (credential === 'FutureCommitments') {
                acc.push({
                    alias: 'futureCommitment',
                    heading: 'The Far Future Foundation ',
                    subheading: 'Future Commitment',
                    icon: 'future_foundation.png'
                });
            } else if (credential === 'PresentCommitments') {
                acc.push({
                    alias: 'presentCommitment',
                    heading: 'The Now Foundation',
                    subheading: 'Present Commitment',
                    icon: 'present_foundation.png'
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

    .icon-company,
    .icon-bank,
    .icon-insurance {
        background: linear-gradient(0deg, #92d0f3 -57.14%, #913dd1 207.14%);
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
                    class:icon-company="{object.alias === 'company'}"
                    class:icon-bank="{object.alias === 'bank'}"
                    class:icon-insurance="{object.alias === 'insurance'}"
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
