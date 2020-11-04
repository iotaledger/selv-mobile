// @ts-ignore
import { readFile, writeFile } from 'fs';
// @ts-ignore
import { resolve } from 'path';
// @ts-ignore
import { promisify } from 'util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

// Based on https://github.com/nklayman/vue-cli-plugin-capacitor/blob/facb7050b89348478f0a6a865301a84d22b8a446/index.js#L159-L177

const SERVER_URL = process.env.CAPACITOR_SERVER_URL || 'http://localhost:3001';
const CONFIG_PATH = resolve(__dirname, '..', 'capacitor.config.json');

const patchConfigForLiveReload = async () => {
    // Read and parse config
    const capacitorConfig = JSON.parse(await readFileAsync(CONFIG_PATH, 'utf8'));

    // Don't overwrite the rest of the server property if it already exists
    // If it doesn't exist, create it
    capacitorConfig.server = capacitorConfig.server || {};
    capacitorConfig.server.url = SERVER_URL;

    // Write updated config
    await writeFileAsync(CONFIG_PATH, JSON.stringify(capacitorConfig), 'utf8');
};

patchConfigForLiveReload();
