import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { config } from '~/config';

/**
 * Secrets core must read back (webhook signing secrets, gateway keys), sealed
 * with AES-256-GCM. The key comes from `CORE_ENCRYPTION_KEY`, else is derived
 * from `CORE_JWT_SECRET`; neither is in the database, so a database dump
 * alone doesn't reveal them. Format: `v1.<iv>.<tag>.<ciphertext>` (base64url).
 */
const key = () =>
  Buffer.from(
    hkdfSync('sha256', config.auth.encryptionKey ?? config.auth.jwtSecret, Buffer.alloc(0), 'erxes-core-secrets-v1', 32),
  );

export const seal = (plain: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
};

export const unseal = (sealed: string) => {
  const [version, iv, tag, data] = sealed.split('.');

  if (version !== 'v1' || !iv || !tag || !data) throw new Error('not a sealed secret');

  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));

  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
};
