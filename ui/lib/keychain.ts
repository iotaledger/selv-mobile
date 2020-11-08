import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';

const { SecureStoragePlugin } = Plugins;

/**
 * Keychain adapter
 */
export default {
    get(key: string): Promise<{ value: string }> {
        return SecureStoragePlugin.get({ key });
    },
    set(key: string, value: string): Promise<{ value: boolean }> {
        return SecureStoragePlugin.set({ key, value });
    },
    remove(key: string): Promise<boolean> {
        return SecureStoragePlugin.remove({ key });
    },
    clear(): Promise<boolean> {
        return SecureStoragePlugin.clear();
    },
};
