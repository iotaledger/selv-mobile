import { readable } from 'svelte/store';

/**
 * Application current path
 */
const path = readable<string>(null, (set) => {
    const updatePath = (): void => {
        const pathName = window.location.hash.substr(1);
        set(pathName);
    };

    window.addEventListener('hashchange', updatePath);
    updatePath();

    return (): void => {
        window.removeEventListener('hashchange', updatePath);
    };
});

export default path;
