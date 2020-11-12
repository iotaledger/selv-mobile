// @ts-ignore
import { readFile, writeFile } from 'fs';
// @ts-ignore
import { resolve } from 'path';
// @ts-ignore
import { promisify } from 'util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

// @ts-ignore
const CONFIG_PATH = resolve(__dirname, '..', 'capacitor.config.json');

const revertLiveReloadPatch = async () => {
    // Read and parse config
    const capacitorConfig = JSON.parse(await readFileAsync(CONFIG_PATH, 'utf8'));

    // Remove server.url prop, it can't be checked in because it could end up in production
    if (capacitorConfig.server && capacitorConfig.server.url) {
        delete capacitorConfig.server.url;
    }

    // Write updated config
    await writeFileAsync(CONFIG_PATH, JSON.stringify(capacitorConfig, null, 4), 'utf8');
};

revertLiveReloadPatch();
