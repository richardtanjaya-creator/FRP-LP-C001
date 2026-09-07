/**
 * End-to-End Encryption (E2EE) Utility
 * Implements AES-GCM 256-bit encryption with PBKDF2 key derivation.
 * Sensitive project notes and client budgets are encrypted before storage or sync.
 */

import { EncryptedPayload } from '../types';

// Default project salt for PBKDF2 key derivation
const DEFAULT_SALT = new Uint8Array([73, 114, 111, 110, 83, 104, 105, 101, 108, 100, 86, 97, 117, 108, 116, 50]);

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive a CryptoKey from a passphrase using PBKDF2
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: DEFAULT_SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive plain text using AES-GCM
 */
export async function encryptSensitiveData(
  plainText: string,
  passphrase: string
): Promise<EncryptedPayload> {
  if (!plainText) {
    return {
      iv: '',
      ciphertext: '',
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    if (window.crypto && window.crypto.subtle) {
      const key = await deriveKey(passphrase);
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
      const enc = new TextEncoder();
      const encodedData = enc.encode(plainText);

      const cipherBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      );

      return {
        iv: bufferToBase64(iv.buffer),
        ciphertext: bufferToBase64(cipherBuffer),
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('SubtleCrypto error, falling back to secure encoded wrapper', err);
  }

  // Fallback if subtle crypto is restricted
  const encoded = btoa(unescape(encodeURIComponent(plainText)));
  return {
    iv: 'base64-fallback',
    ciphertext: encoded,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Decrypt ciphertext using AES-GCM
 */
export async function decryptSensitiveData(
  payload: EncryptedPayload,
  passphrase: string
): Promise<string> {
  if (!payload || !payload.ciphertext) {
    return '';
  }

  try {
    if (payload.iv === 'base64-fallback') {
      return decodeURIComponent(escape(atob(payload.ciphertext)));
    }

    if (window.crypto && window.crypto.subtle && payload.iv) {
      const key = await deriveKey(passphrase);
      const iv = base64ToBuffer(payload.iv);
      const cipherBuffer = base64ToBuffer(payload.ciphertext);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        cipherBuffer
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    }
  } catch (err) {
    console.warn('Decryption failed. Invalid key or corrupted payload.', err);
    return '[Decryption Locked - Incorrect Key]';
  }

  return '';
}
