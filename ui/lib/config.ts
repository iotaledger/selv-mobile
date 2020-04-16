const __DEV__ = process.env.NODE_ENV !== 'production'; // eslint-disable-line no-underscore-dangle

export const WEBSOCKETS_URL = __DEV__ ? 'http://localhost:8000' : 'https://selv01.iota.cafe:8888';

export const API_URL = __DEV__ ? 'http://localhost:4000' : 'https://selv01.iota.cafe';

export const IOTA_NODE_URL = 'https://nodes.iota.org';

export const RANDOM_USER_DATA_API_URL = 'https://randomuser.me/api/';

export const KEY_ID = 'selv';

export const SPLASH_SCREEN_TIMEOUT = 2000;

export const DEFAULT_LANGUAGE = 'English';

export const DEFAULT_LOCALE = 'en';
