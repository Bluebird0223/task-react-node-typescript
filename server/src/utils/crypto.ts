import crypto from 'crypto';

const BACKEND_KEY = process.env.BACKEND_ENCRYPTION_KEY
const ALGORITHM = 'aes-256-cbc';

// Derive a proper key from the password
const deriveKey = (password: string): Buffer => {
    return crypto.scryptSync(password, 'salt', 32);
};

const BACKEND_KEY_BUFFER = deriveKey(BACKEND_KEY || 'taskNodeSecretKey123');

// Backend encryption (2nd level)
export const backendEncrypt = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, BACKEND_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

// Backend decryption (2nd level)
export const backendDecrypt = (encryptedText: string): string => {
    const [ivHex, encryptedData] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, BACKEND_KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
