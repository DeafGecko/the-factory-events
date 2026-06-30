// src/lib/auth.ts — Web Crypto API (Cloudflare Workers compatible)

export function generateToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getTokenExpiry(hoursFromNow = 48): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursFromNow);
  return expiry.toISOString();
}

export function isTokenExpired(expiry: string): boolean {
  return new Date(expiry) < new Date();
}

// ── Password hashing (PBKDF2) ──
const saltRounds = 100000;
const hashLength = 64;
const algorithm = 'SHA-256';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: saltRounds,
      hash: algorithm,
    },
    keyMaterial,
    hashLength * 8
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: saltRounds,
      hash: algorithm,
    },
    keyMaterial,
    hashLength * 8
  );
  const hashArray = new Uint8Array(derivedBits);
  const computedHash = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hashHex;
}