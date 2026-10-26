import crypto from 'crypto';
import { ExpectedError } from 'erxes-api-shared/utils';

/**
 * BYOK key sealing — AES-256-GCM envelope for `config.apiKey` at rest.
 *
 * Key = HKDF-SHA256(ikm: JWT_TOKEN_SECRET, salt: 'erxes-agents',
 * info: 'byok-api-key-v1', 32 bytes), derived once per process. The stored
 * format is `enc:v1:<iv b64url>:<tag b64url>:<ciphertext b64url>` — the
 * version prefix leaves room for rotation.
 *
 * Fail-closed rules:
 * - `sealSecret` throws when JWT_TOKEN_SECRET is unset — plaintext must
 *   never reach the database;
 * - `openSecret` returns null on a missing secret or a bad tag (wrong or
 *   rotated secret) — callers treat that as "no key", so a rotated secret
 *   degrades to "re-enter your key" rather than a crash;
 * - legacy plaintext (no `enc:v1:` prefix) passes through unchanged so
 *   readers can lazily re-seal it;
 * - nothing here ever logs or echoes key material.
 */

const PREFIX = 'enc:v1:';
const IV_BYTES = 12;
const TAG_BYTES = 16;

let cachedKey: Buffer | null | undefined;

const deriveKey = (): Buffer | null => {
  if (cachedKey !== undefined) {
    return cachedKey;
  }

  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret) {
    cachedKey = null;
    return null;
  }

  cachedKey = Buffer.from(
    crypto.hkdfSync(
      'sha256',
      secret,
      'erxes-agents',
      'byok-api-key-v1',
      32,
    ),
  );

  return cachedKey;
};

/** True when the stored value is a sealed envelope, not legacy plaintext. */
export const isSealedSecret = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith(PREFIX);

/**
 * Seals a plaintext key for storage. Throws when the encryption secret is
 * not configured — callers must never fall back to storing plaintext.
 */
export const sealSecret = (plain: string): string => {
  const key = deriveKey();

  if (!key) {
    throw new ExpectedError(
      'Agents key encryption is not configured.',
      'SERVER_ERROR',
    );
  }

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    'enc:v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join(':');
};

/**
 * Opens a stored value. Legacy plaintext passes through unchanged (callers
 * re-seal it on write-back); a tampered or wrongly-keyed envelope, a
 * malformed shape, or a missing secret all return null. The failure log is
 * a fixed string — never the value.
 */
export const openSecret = (stored: unknown): string | null => {
  if (typeof stored !== 'string' || stored.length === 0) {
    return null;
  }

  if (!isSealedSecret(stored)) {
    return stored;
  }

  const key = deriveKey();

  if (!key) {
    return null;
  }

  try {
    // Format: enc:v1:<iv>:<tag>:<ciphertext> — skip the two-part prefix.
    const [, , ivB64, tagB64, dataB64] = stored.split(':');
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const ciphertext = Buffer.from(dataB64, 'base64url');

    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
      return null;
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    // Fixed message only — the stored value is never logged.
    console.warn('[agents] Could not decrypt a stored BYOK key.');
    return null;
  }
};
