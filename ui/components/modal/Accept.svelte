<script>
    import { getContext } from 'svelte';
    import randomstring from 'randomstring';

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
    import {
        prepareBankInformation,
        prepareInsuranceInformation,
        prepareCompanyInformation,
        prepareImmunityInformation,
        prepareVisaInformation,
        prepareFutureCommitmentInformation,
        preparePresentCommitmentInformation,
        decrypt,
        parse,
        encrypt,
        parseLink
    } from '~/lib/helpers';
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
        },
        company: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'Company House',
                    subheading: 'Business Details',
                    icon: 'government-logo.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        },
        bank: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'SNS Bank',
                    subheading: 'Bank Details',
                    icon: 'company-logo.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        },
        insurance: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'SNS Bank',
                    subheading: 'Liability Insurance',
                    icon: 'sns.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        },
        futureCommitment: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'Far Future Foundation',
                    subheading: 'Future Commitment',
                    icon: 'future_foundation.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        },
        presentCommitment: {
            heading: 'Accept certificate?',
            listItems: [
                {
                    heading: 'The Now Foundation',
                    subheading: 'Present Commitment',
                    icon: 'present_foundation.png'
                }
            ],
            label: 'Accept certificate',
            closeText: 'Decline'
        }
    };

    function schemaNameToContentKeyMapper(schemaName) {
        switch (schemaName) {
            case 'TestResult':
                return 'immunity';
            case 'Company':
                return 'company';
            case 'BankAccount':
                return 'bank';
            case 'Insurance':
                return 'insurance';
            default:
                return 'visa';
        }
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

        Socket.getActiveSocket(props.payload.url).emit('rejectCredentials', {
            channelId,
            payload: 'The request to accept credentials was declined.'
        });

        modalStatus.set({ active: false, type: null });
    }

    function processCustomCredential(schemaName, data) {
        const payload = Object.assign({}, data);

        isCreatingCredential = true;

        if (customSchemaName === 'company') {
            payload.data.CompanyNumber = randomstring.generate({
                length: 7,
                charset: 'numeric'
            });
            payload.data.CompanyOwner = `${$credentials.personal.data.firstName} ${$credentials.personal.data.lastName}`;
            payload.data.CompanyStatus = 'Pending';
            payload.data.CompanyCreationDate = new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } else if (customSchemaName === 'bank') {
            payload.data.AccountNumber = randomstring.generate({
                length: 11,
                charset: 'numeric'
            });
        } else if (customSchemaName === 'insurance') {
            payload.data.Name = 'SNS Bank';
            const date = new Date();

            payload.data.StartDate = date.toLocaleDateString();
            payload.data.EndDate = new Date(date.setFullYear(date.getFullYear() + 1)).toLocaleDateString();
        }

        retrieveIdentity()
            .then((identity) => {
                createCredential(identity, schemaName, payload.data).then((credential) =>
                    storeCredential(schemaName, credential).then(() => {
                        let password = $credentials.immunity.password;
                        let channelId = $credentials.immunity.channelId;

                        if (customSchemaName === 'visa') {
                            password = $credentials.visa.password;
                            channelId = $credentials.visa.channelId;
                        }

                        if (customSchemaName === 'bank') {
                            password = $credentials.bank.password;
                            channelId = $credentials.bank.channelId;
                        } else if (customSchemaName === 'insurance') {
                            password = $credentials.insurance.password;
                            channelId = $credentials.insurance.channelId;
                        } else if (customSchemaName === 'company') {
                            password = $credentials.company.password;
                            channelId = $credentials.company.channelId;
                        } else if (customSchemaName === 'futureCommitment') {
                            password = $credentials.futureCommitment.password;
                            channelId = $credentials.futureCommitment.channelId;
                        } else if (customSchemaName === 'presentCommitment') {
                            password = $credentials.presentCommitment.password;
                            channelId = $credentials.presentCommitment.channelId;
                        }

                        Socket.getActiveSocket(payload.url).emit('createCompany', { payload: payload.data });

                        Socket.getActiveSocket(payload.url).emit('createCredentialConfirmation', {
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

                        if (customSchemaName === 'bank') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    bank: Object.assign({}, existingCredentials.bank, {
                                        data: prepareBankInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        } else if (customSchemaName === 'insurance') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    insurance: Object.assign({}, existingCredentials.insurance, {
                                        data: prepareInsuranceInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        } else if (customSchemaName === 'company') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    company: Object.assign({}, existingCredentials.company, {
                                        data: prepareCompanyInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        } else if (customSchemaName === 'futureCommitment') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    futureCommitment: Object.assign({}, existingCredentials.futureCommitment, {
                                        data: prepareFutureCommitmentInformation(credential.credentialSubject),
                                        password: null,
                                        channelId: null
                                    })
                                })
                            );
                        } else if (customSchemaName === 'presentCommitment') {
                            credentials.update((existingCredentials) =>
                                Object.assign({}, existingCredentials, {
                                    presentCommitment: Object.assign({}, existingCredentials.presentCommitment, {
                                        data: preparePresentCommitmentInformation(credential.credentialSubject),
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
