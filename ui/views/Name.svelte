<script>
    import { Plugins } from '@capacitor/core';
    import { onDestroy } from 'svelte';

    import Button from '~/components/Button';
    import TextField from '~/components/TextField';
    import Header from '~/components/Header';

    import { preparePersonalInformation, getRandomUserData, goto } from '~/lib/helpers';
    import { credentials, userData, hasSetupAccount } from '~/lib/store';
    import { createIdentity, storeIdentity, retrieveIdentity, createCredential, storeCredential } from '~/lib/identity';
    import { SchemaNames } from '~/lib/identity/schemas';
    import { __WEB__ } from '~/lib/platform';

    const { Keyboard } = Plugins;

    let isCreatingCredentials = false;
    let firstName = '';
    let isKeyboardActive = false;

    let background;

    const isRunningOnMobile = !__WEB__;

    if (isRunningOnMobile) {
        Keyboard.addListener('keyboardDidShow', () => {
            isKeyboardActive = true;
        });

        Keyboard.addListener('keyboardWillHide', () => {
            isKeyboardActive = false;
        });
    }

    function handleOuterClick() {
        if (event.target === background) {
            event.preventDefault();

            if (document.activeElement) {
                document.activeElement.blur();
            }
        }
    }

    function save() {
        isCreatingCredentials = true;

        if (isRunningOnMobile) {
            Keyboard.hide();
        }

        setTimeout(() => {
            retrieveIdentity()
                .then((identity) =>
                    identity
                        ? Promise.resolve(identity)
                        : createIdentity().then((newIdentity) => storeIdentity('did', newIdentity).then(() => newIdentity))
                )
                .then((identity) =>
                    getRandomUserData().then((data) =>
                        Promise.all([
                            createCredential(identity, SchemaNames.ADDRESS, {
                                UserAddress: {
                                    City: data.location.city,
                                    State: data.location.state,
                                    Country: data.location.country,
                                    Postcode: data.location.postcode.toString(),
                                    Street: data.location.street.number.toString(),
                                    House: data.location.street.name
                                }
                            }),
                            createCredential(identity, SchemaNames.PERSONAL_DATA, {
                                UserPersonalData: {
                                    UserName: {
                                        FirstName: firstName,
                                        LastName: data.name.last
                                    },
                                    UserDOB: {
                                        Date: data.dob.date
                                    },
                                    Birthplace: data.location.city,
                                    Nationality: data.location.country,
                                    IdentityCardNumber: data.id.value,
                                    PassportNumber: Math.random()
                                        .toString(36)
                                        .substring(7)
                                        .toUpperCase()
                                }
                            })
                        ])
                    )
                )
                .then((result) => {
                    const [addressCredential, personalDataCredential] = result;

                    Promise.all([
                        storeCredential(SchemaNames.ADDRESS, addressCredential),
                        storeCredential(SchemaNames.PERSONAL_DATA, personalDataCredential)
                    ]).then(() => {
                        const personalInfo = {
                            ...preparePersonalInformation(
                                addressCredential.credentialSubject,
                                personalDataCredential.credentialSubject
                            )
                        };

                        credentials.update((existingCredentials) =>
                            Object.assign({}, existingCredentials, {
                                personal: Object.assign({}, existingCredentials.personal, {
                                    data: personalInfo
                                })
                            })
                        );

                        isCreatingCredentials = false;
                        hasSetupAccount.set(true);
                        goto('onboarding/home');
                    });
                })
                .catch((error) => {
                    console.error(error);

                    isCreatingCredentials = false;
                });
        }, 500);
    }
</script>

<style>
    main {
        height: 100%;
        background-color: var(--bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .content {
        text-align: center;
        z-index: 1;
    }

    .content > img {
        mix-blend-mode: multiply;
    }

    footer {
        padding: 0px 7vw;
    }

    img {
        width: 33vw;
        height: 27vh;
    }
</style>

<main bind:this="{background}" on:click="{handleOuterClick}" style="padding: {isKeyboardActive ? '0px 13vw 1vh' : '6vh 13vw'}">
    <Header text="Set your first name" />

    <div class="content">
        <img src="set-name.png" alt="" />
    </div>

    <TextField disabled="{isCreatingCredentials}" bind:value="{firstName}" placeholder="First name" />

    <footer>
        <Button loading="{isCreatingCredentials}" disabled="{firstName.length === 0}" label="Save Name" onClick="{save}" />
    </footer>
</main>
