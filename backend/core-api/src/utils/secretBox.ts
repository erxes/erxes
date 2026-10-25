import crypto from 'crypto';
import { ExpectedError } from 'erxes-api-shared/utils';

/**
 * AES-256-GCM sealing for secrets stored by core modules.
 *
 * Each box derives its own key: HKDF-SHA256(ikm: JWT_TOKEN_SECRET, salt,
 * info, 32 bytes), once per process, so two modules never share a key. The
 * stored format is `enc:v1:<iv b64url>:<tag b64url>:<ciphertext b64url>`.
 * An optional `aad` (for example a record id and field key) is authenticated
 * with the value, so an envelope copied to another record does not open.
 *
 * Fail-closed rules:
 * - `seal` throws when JWT_TOKEN_SECRET is unset — plaintext must never
 *   reach the database;
 * - `open` returns null on a missing secret, a bad tag (wrong or rotated
 *   secret, other aad) or a malformed envelope;
 * - stored plaintext (no `enc:v1:` prefix) passes through only for boxes
 *   created with `legacyPlaintext`, so their readers can lazily re-seal it;
 * - nothing here ever logs or echoes the value.
 */

const PREFIX = 'enc:v1:';
const IV_BYTES = 12;
const TAG_BYTES = 16;

export interface ISecretBoxOptions {
  salt: string;
  info: string;
  // Shown when sealing without JWT_TOKEN_SECRET.
  notConfiguredMessage: string;
  // Shown (fixed text, never the value) when an envelope does not open.
  openFailureWarning: string;
  legacyPlaintext?: boolean;
}

export interface ISecretBox {
  isSealed(value: unknown): value is string;
  seal(plain: string, aad?: string): string;
  open(stored: unknown, aad?: string): string | null;
}

export const createSecretBox = ({
  salt,
  info,
  notConfiguredMessage,
  openFailureWarning,
  legacyPlaintext = false,
}: ISecretBoxOptions): ISecretBox => {
  let cachedKey: Buffer | null | undefined;

  const deriveKey = (): Buffer | null => {
    if (cachedKey !== undefined) {
      return cachedKey;
    }

    const secret = process.env.JWT_TOKEN_SECRET;

    cachedKey = secret
      ? Buffer.from(crypto.hkdfSync('sha256', secret, salt, info, 32))
      : null;

    return cachedKey;
  };

  const isSealed = (value: unknown): value is string =>
    typeof value === 'string' && value.startsWith(PREFIX);

  const seal = (plain: string, aad?: string): string => {
    const key = deriveKey();

    if (!key) {
      throw new ExpectedError(notConfiguredMessage, 'SERVER_ERROR');
    }

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    if (aad) {
      cipher.setAAD(Buffer.from(aad, 'utf8'));
    }

    const ciphertext = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [
      'enc:v1',
      iv.toString('base64url'),
      tag.toString('base64url'),
      ciphertext.toString('base64url'),
    ].join(':');
  };

  const open = (stored: unknown, aad?: string): string | null => {
    if (typeof stored !== 'string' || stored.length === 0) {
      return null;
    }

    if (!isSealed(stored)) {
      return legacyPlaintext ? stored : null;
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

      if (aad) {
        decipher.setAAD(Buffer.from(aad, 'utf8'));
      }

      decipher.setAuthTag(tag);

      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      console.warn(openFailureWarning);
      return null;
    }
  };

  return { isSealed, seal, open };
};
