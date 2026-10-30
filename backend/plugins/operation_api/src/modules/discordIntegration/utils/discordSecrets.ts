import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { getEnv } from 'erxes-api-shared/utils';

const PREFIX = 'enc:v1';
const SALT = 'erxes-operation-discord';
const ALGORITHM = 'aes-256-gcm';

type TKeyId = 'k' | 'j';

const KEY_SOURCES: Record<TKeyId, string> = {
  k: 'OPERATION_DISCORD_SECRET_KEY',
  j: 'JWT_TOKEN_SECRET',
};

const keyCache = new Map<string, Buffer>();

const getKey = (keyId: TKeyId) => {
  const source = getEnv({ name: KEY_SOURCES[keyId] });

  if (!source) {
    return null;
  }

  const cacheKey = `${keyId}:${source}`;
  const cached = keyCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const key = scryptSync(source, SALT, 32);

  keyCache.set(cacheKey, key);

  return key;
};

const getActiveKeyId = (): TKeyId | null => {
  if (getKey('k')) {
    return 'k';
  }

  return getKey('j') ? 'j' : null;
};

export const isSealedDiscordSecret = (value?: string | null) =>
  Boolean(value?.startsWith(`${PREFIX}:`));

export const sealDiscordSecret = (value: string) => {
  const keyId = getActiveKeyId();
  const key = keyId ? getKey(keyId) : null;

  if (!keyId || !key) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

  return [
    PREFIX,
    keyId,
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    data.toString('base64'),
  ].join(':');
};

export const openDiscordSecret = (value?: string | null) => {
  if (!value) {
    return '';
  }

  if (!isSealedDiscordSecret(value)) {
    return value;
  }

  const [, , keyId, iv, tag, data] = value.split(':');
  const key = keyId === 'k' || keyId === 'j' ? getKey(keyId) : null;

  if (!key || !iv || !tag || !data) {
    throw new Error(
      'Discord credentials cannot be decrypted. Restore the encryption key or connect the server again.',
    );
  }

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(data, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error(
      'Discord credentials cannot be decrypted. Restore the encryption key or connect the server again.',
    );
  }
};
