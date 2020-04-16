declare module 'browserify-aes' {
    import { BinaryLike, CipherCCMTypes, CipherKey, Cipher, Decipher } from 'crypto';
    import { TransformOptions } from 'stream';

    export function createCipheriv(algorithm: string, key: CipherKey, iv: BinaryLike | null, options?: CipherCCMTypes): Cipher;
    export function createDecipheriv(
        algorithm: string,
        key: BinaryLike,
        iv: BinaryLike | null,
        options?: TransformOptions
    ): Decipher;
}
