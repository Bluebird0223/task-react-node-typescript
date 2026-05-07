// Using Web Crypto API (built into all modern browsers)
const ALGORITHM = 'AES-CBC';
const FRONTEND_KEY = 'myFrontendSecretKey456!';

// Convert string key to CryptoKey
const getCryptoKey = async (keyString: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(keyString),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('salt'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

// Convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

// Convert hex string to ArrayBuffer
const hexToBuffer = (hex: string): ArrayBuffer => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
};

// Frontend encryption (1st level)
export const frontendEncrypt = async (text: string): Promise<string> => {
    try {
        const key = await getCryptoKey(FRONTEND_KEY);
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        // Use a static IV for deterministic encryption so that email/password matching works
        const iv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

        const encrypted = await crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            data
        );

        return `${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};

// Frontend decryption (final level)
export const frontendDecrypt = async (encryptedText: string): Promise<string> => {
    try {
        if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            return encryptedText;
        }
        
        const [ivHex, encryptedHex] = encryptedText.split(':');
        const key = await getCryptoKey(FRONTEND_KEY);
        const iv = new Uint8Array(hexToBuffer(ivHex));
        const encrypted = hexToBuffer(encryptedHex);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            key,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText;
    }
};

// For double encryption before sending to backend
export const doubleEncryptForBackend = async (text: string): Promise<string> => {
    return await frontendEncrypt(text);
};

// For final decryption of data from backend
export const finalDecrypt = async (partiallyEncryptedText: string): Promise<string> => {
    return await frontendDecrypt(partiallyEncryptedText);
};