import { writable } from 'svelte/store';

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

/**
 * Credential types
 */
export type CredentialTypes = 'personal' | 'immunity' | 'visa';

/**
 * Personal credential information
 */
export type PersonalInfo = {
    firstName?: string;
    lastName?: string;
    dateOfBirth: string;
    birthPlace: string;
    nationality: string;
    countryOfResidence: string;
    address: string;
    identityCardNumber: string;
    passportNumber: string;
};

/**
 * Immunity credential information
 */
export type ImmunityInfo = {
    testId: string;
    testedBy: string;
    testTimestamp: string;
    testKit: string;
    testResult: string;
};

/**
 * Visa application credential information
 */
export type VisaInfo = {
    visaApplicationNumber: string;
    visaCountry: string;
};

/**
 * Credentials (personal, company, bank, insurance)
 */
export type Credentials = {
    [key in CredentialTypes]: {
        heading: string;
        subheading: string;
        data: PersonalInfo;
        channelId?: string;
        password?: string;
    };
};

/**
 * Modal status
 */
export type ModalStatus = {
    active: boolean;
    type: 'share' | 'accept' | 'generate' | null;
    props?: any;
};

export type SocketConnectionState = 'connected' | 'disconnected' | 'registerMobileClient';

type SocketConnection = {
    state: SocketConnectionState;
    payload: any;
};

export const modalStatus = writable<ModalStatus>({ active: false, type: null, props: null });

export const landingIndex = writable<number>(0);

export const activeCredentialForInfo = writable<CredentialTypes>(null);

export const socketConnectionState = writable<SocketConnection>({ state: 'disconnected', payload: null });

export const qrCode = writable<string>('');

export const credentials = writable<Credentials>({
    personal: {
        heading: 'Home Office',
        subheading: 'Personal Information',
        data: null
    },
    immunity: {
        heading: 'Public Health Authority',
        subheading: 'Immunity Certificate',
        data: null
    },
    visa: {
        heading: 'Foreign Border Agency',
        subheading: 'Travel Visa',
        data: null
    }
});
