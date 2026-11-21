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

const vaultKey = () => coreKey('erxes-core-integration-vault-v1');

/**
 * An integration's secrets, sealed for one organisation (and plugin, when `binding` names one):
 * a row or text copied to another doesn't open.
 */
export const sealFor = (binding: readonly string[], plain: string) =>
  encrypt(vaultKey(), plain, binding.join(':'));

export const unsealFor = (binding: readonly string[], sealed: string) =>
  decrypt(vaultKey(), sealed, binding.join(':'));
