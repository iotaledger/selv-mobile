/* eslint-disable no-underscore-dangle */
const __DEV__ = process.env.NODE_ENV !== 'production';

/** Determines if devnet should be used (instead of mainnet) */
const __DEVNET__ = true;

export const API_URL = __DEV__ ? 'http://localhost:4000' : 'https://selv01.iota.cafe';

export const IOTA_NODE_URL = __DEVNET__ ? 'https://altnodes.devnet.iota.org/' : 'https://nodes.thetangle.org:443';

export const RANDOM_USER_DATA_API_URL = 'https://randomuser.me/api/';

export const KEY_ID = 'selv';

export const SPLASH_SCREEN_TIMEOUT = 2000;

export const MINIMUM_WEIGHT_MAGNITUDE = __DEVNET__ ? 9 : 14;

export const DEPTH = 3;

export const DEFAULT_TAG = 'COVID';

export const DEFAULT_LANGUAGE = 'English';

export const DEFAULT_LOCALE = 'en';
