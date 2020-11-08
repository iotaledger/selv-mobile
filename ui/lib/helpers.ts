import Hammer from 'hammerjs';

import { v4 as uuidv4 } from 'uuid';

import { createCipheriv, createDecipheriv } from 'browserify-aes';
import { writable, Writable } from 'svelte/store';

import type { VerifiableCredentialDataModel, VerifiablePresentationDataModel } from '@iota/identity';

import type { QRLink } from '~/lib/store';

import { RANDOM_USER_DATA_API_URL } from '~/lib/config';

/**
 * Random user data
 */
export type RandomUserData = {
    location: {
        street: {
            number: number;
            name: string;
        };
        city: string;
        state: string;
        country: string;
        postcode: number;
    };
    name: {
        first: string;
        last: string;
    };
    phone: string;
    dob: {
        date: string;
        age: string;
    };
    email: string;
    id: {
        value: string;
    };
};

/**
 * Random user data response
 */
export type RandomUserDataResponse = {
    results: RandomUserData[];
};

/**
 * Parses serialised data
 *
 * @method parse
 *
 * @param {string} data
 * @returns {object}
 */
export const parse = (data: string): any => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

/**
 * Converts byte array to hex
 *
 * @method convertByteArrayToHex
 *
 * @param {Uint8Array} bytes
 *
 * @return {string}
 */
export const convertByteArrayToHex = (bytes: Uint8Array): string => {
    const hex = [];

    /* eslint-disable no-plusplus,no-bitwise */
    for (let i = 0; i < bytes.length; i++) {
        const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xf).toString(16));
    }

    /* eslint-enable no-plusplus,no-bitwise */
    return hex.join('');
};

/**
 * Parses QR link
 *
 * @method parseLink
 *
 * @param {string} link
 *
 * @returns {QRLink}
 */
export const parseLink = (link: string): QRLink => {
    // TODO: fix this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return link as QRLink;
};

export const isChannelInfo = (payload: QRLink | unknown): payload is QRLink => {
    return (payload as QRLink).channelId !== undefined;
};

export const isVerifiablePresentation = (
    payload: VerifiablePresentationDataModel | unknown
): payload is VerifiablePresentationDataModel => {
    return !!(payload as VerifiablePresentationDataModel).verifiableCredential?.length;
};

export const isVerifiableCredential = (
    payload: VerifiableCredentialDataModel | unknown
): payload is VerifiableCredentialDataModel => {
    return !!(payload as VerifiableCredentialDataModel).credentialSubject;
};

/**
 * Encrypts payload with provided password (key)
 *
 * @method encrypt
 *
 * @param {string} key
 * @param {string} payload
 *
 * @returns {string}
 */
export const encrypt = (key: string, payload: string): string => {
    const IV_LENGTH = 16; // For AES, this is always 16
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(payload);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${convertByteArrayToHex(iv)}:${encrypted.toString('hex')}`;
};

/**
 * Decrypts payload with provided password (key)
 *
 * @method decrypt
 *
 * @param {string} key
 * @param {string} payload
 *
 * @returns {string}
 */
export const decrypt = (key: string, payload: string): string => {
    const textParts = payload.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

/**
 * Updates application path
 *
 * @method goto
 *
 * @param {string} path
 *
 * @returns {void}
 */
export const goto = (path: string, params?: { [key: string]: string }): void => {
    window.location.hash = `${path}${params ? `?${new URLSearchParams(params).toString()}` : ''}`;
};

/**
 * Synchronous timeout
 *
 * @method delay
 *
 * @param {number} ms
 *
 * @returns {void}
 */
export const delay = (ms: number): void => {
    const startPoint = new Date().getTime();
    while (new Date().getTime() - startPoint <= ms);
};

/**
 * Gets random user data
 *
 * @method getRandomUserData
 *
 * @returns {Promise<UserData>}
 */
export const getRandomUserData = (): Promise<RandomUserData> => {
    return fetch(RANDOM_USER_DATA_API_URL)
        .then((response) => response.json())
        .then((result: RandomUserDataResponse) => {
            const randomData = result.results[0];

            return randomData;
        });
};

/**
 * Detects a swipe gesture and triggers an event
 *
 * @method detectSwipeGesture
 *
 * @param {string} elementId
 * @param {string} swipe
 * @param {function} onSwipe
 *
 * @returns {void}
 */
export const detectSwipeGesture = (elementId: string, swipe: string, onSwipe: () => void): void => {
    if (window.matchMedia('(pointer: coarse)').matches) {
        const hammer = new Hammer(document.getElementById(elementId));
        hammer.get('swipe').set({
            direction:
                swipe.includes('left') || swipe.includes('right') ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL,
        });
        hammer.on(swipe, () => {
            onSwipe();
        });
    }
};

/**
 * Persist a writable Svelte store to local storage
 */
export const persistent = <T>(key: string, initialValue: T, saveTransformation?: (value: T) => T): Writable<T> => {
    let value = initialValue;

    try {
        const json = localStorage.getItem(key);
        if (json) {
            value = JSON.parse(json);
        }
    } catch (err) {
        console.error(err);
    }

    const state = writable(value);

    state.subscribe(($value): void => {
        localStorage.setItem(key, JSON.stringify(saveTransformation ? saveTransformation($value) : $value));
    });

    return state;
};

export const generateRandomId = (): string => uuidv4();

export const getImageSrc = (name: string): string => {
    if (name === 'personal') {
        return 'government-logo.png';
    }
    if (name === 'immunity') {
        return 'health-authority-logo.png';
    }
    if (name === 'bank' || name === 'insurance') {
        return 'sns.png';
    }
    if (name === 'company') {
        return 'government-logo.png';
    }

    return 'border-agency-logo.png';
};
