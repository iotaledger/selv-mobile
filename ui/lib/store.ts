import { writable } from 'svelte/store';
import { persistent } from '~/lib/helpers';
import { enrichCredential, storeCredential, removeCredential, VerifiableCredentialEnrichment } from './identity';

/**
 * Determines if use has completed onboarding
 */
export const hasSetupAccount = persistent<boolean>('hasSetupAccount', false);

export const listOfCredentials = persistent<{ init: boolean; values: string[] }>(
    'listOfCredentials',
    {
        init: false,
        values: [],
    },
    (value) => ({ ...value, init: false })
);

export const account = persistent<{ name: string } | null>('account', null);
/**
 * QR Link
 */
export type QRLink = {
    channelId: string;
    password: string;
    challenge: string;
    requestedCredentials: string[];
    shareWith: 'healthAuthority' | 'employer' | 'agency';
};

export interface InternalCredentialDataModel {
    id : string;
    metaInformation: {
        issuer: string;
        receivedAt: string;
    };
    enrichment: VerifiableCredentialEnrichment | null;
    credentialDocument: any;
}

/**
 * Modal status
 */
export type ModalStatus = {
    active: boolean;
    type: 'share' | 'accept' | 'generate' | null;
    props?: any;
};

export const modalStatus = writable<ModalStatus>({ active: false, type: null, props: null });

export type SocketConnectionState = 'connected' | 'disconnected' | 'registerMobileClient';

type SocketConnection = {
    state: SocketConnectionState;
    payload: any;
};

export const socketConnectionState = writable<SocketConnection>({ state: 'disconnected', payload: null });

export const landingIndex = writable<number>(0);

export const qrCode = writable<string>('');

export const storedCredentials = writable<InternalCredentialDataModel[]>([]);

storedCredentials.subscribe((value) => {
    listOfCredentials.update((prev) => {
        if (prev.init) {
            const idsToDelete = prev.values.filter((id) => !value.find((credential) => credential.id === id));
            idsToDelete.map((id) => removeCredential(id));
            return { ...prev, values: value.map((credential) => credential.id) };
        }
        return { ...prev, init: true };
    });
    value.map((credential) => {
        if (!credential.enrichment) {
            enrichCredential(credential.credentialDocument).then((enrichment) => {
                storedCredentials.update((prev) =>
                    prev.map((prevCredential) =>
                        prevCredential.id === credential.id
                            ? { ...prevCredential, enrichment }
                            : prevCredential
                    )
                );
            });
        }
        return storeCredential(credential.id, credential);
    });
});

export const currentPresentation = writable<{
    enrichment: VerifiableCredentialEnrichment | null;
    presentationDocument: any;
}>(null);

currentPresentation.subscribe((presentation) => {
    if (presentation && !presentation.enrichment) {
        // TODO: which document to use for enrichment
        enrichCredential(presentation.presentationDocument.verifiableCredential[0]).then((enrichment) => {
            currentPresentation.update((prev) => ({ ...prev, enrichment }));
        });
    }
});

export const currentCredentialToAccept = writable<InternalCredentialDataModel>(null);

currentCredentialToAccept.subscribe((credential) => {
    if (credential && !credential.enrichment) {
        enrichCredential(credential.credentialDocument).then((enrichment) => {
            currentCredentialToAccept.update((prev) => ({ ...prev, enrichment }));
        });
    }
});

export const unconfirmedCredentials = writable<InternalCredentialDataModel[]>([]);

export const unconfirmedRequests = writable<InternalCredentialDataModel[]>([]);

/**
 * Error string
 */
export const error = writable<string>(null);

let errorTimeout: any;

error.subscribe((item) => {
    clearTimeout(errorTimeout);
    if (item) {
        errorTimeout = setTimeout(() => {
            error.set(null);
        }, 3500);
    }
});
