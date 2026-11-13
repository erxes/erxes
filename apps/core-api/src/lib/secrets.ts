import { config } from '~/config';
import { decrypt, deriveKey, encrypt } from './crypto';

/**
 * Keys core derives from `CORE_ENCRYPTION_KEY`, else `CORE_JWT_SECRET`, one per
 * purpose (`info`). Neither is in the database, so a database dump alone
 * doesn't reveal what they seal or sign.
 */
export const coreKey = (info: string) =>
  deriveKey(config.auth.encryptionKey ?? config.auth.jwtSecret, info);

const sealKey = () => coreKey('erxes-core-secrets-v1');

/** Secrets core must read back (webhook signing secrets, gateway keys). */
export const seal = (plain: string) => encrypt(sealKey(), plain);

export const unseal = (sealed: string) => decrypt(sealKey(), sealed);
