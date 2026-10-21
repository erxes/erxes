import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { CredentialsError } from './types';
import type { CredentialEnvelope, CredentialValues } from './types';

export interface VaultEnvironment {
  [name: string]: string | undefined;
  CREDENTIALS_VAULT_KEY?: string;
  CREDENTIALS_VAULT_KEY_ID?: string;
}

const unavailable = (): never => {
  throw new CredentialsError();
};

export const readVaultKey = (environment: VaultEnvironment = process.env) => {
  const encoded = environment.CREDENTIALS_VAULT_KEY;
  const keyId = environment.CREDENTIALS_VAULT_KEY_ID;
  if (!encoded || !keyId || !/^[A-Za-z0-9_-]{1,64}$/.test(keyId)) return unavailable();
  if (!/^[A-Za-z0-9+/]{43}=$/.test(encoded)) return unavailable();
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encoded) return unavailable();
  return { key, keyId };
};

const aad = (tenant: string, recordId: string, keyId: string) => {
  if (!tenant || !recordId) return unavailable();
  return Buffer.from(JSON.stringify(['erxes.credentials', 1, keyId, tenant, recordId]));
};

export const encryptValues = (
  values: CredentialValues,
  tenant: string,
  recordId: string,
  environment: VaultEnvironment = process.env,
): CredentialEnvelope => {
  const { key, keyId } = readVaultKey(environment);
  const plaintext = Buffer.from(JSON.stringify(values));
  try {
    const nonce = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, nonce);
    cipher.setAAD(aad(tenant, recordId, keyId));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return {
      version: 1,
      keyId,
      nonce: nonce.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
    };
  } catch {
    return unavailable();
  } finally {
    key.fill(0);
    plaintext.fill(0);
  }
};

const decode = (value: string, length?: number): Buffer => {
  if (typeof value !== 'string' || value.length > 262144) return unavailable();
  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value || (length && decoded.length !== length)) {
    return unavailable();
  }
  return decoded;
};

export const decryptValues = (
  envelope: CredentialEnvelope,
  tenant: string,
  recordId: string,
  environment: VaultEnvironment = process.env,
): CredentialValues => {
  const { key, keyId } = readVaultKey(environment);
  let plaintext: Buffer | undefined;
  try {
    if (!envelope || envelope.version !== 1 || envelope.keyId !== keyId) return unavailable();
    const decipher = createDecipheriv('aes-256-gcm', key, decode(envelope.nonce, 12));
    decipher.setAAD(aad(tenant, recordId, keyId));
    decipher.setAuthTag(decode(envelope.tag, 16));
    plaintext = Buffer.concat([decipher.update(decode(envelope.ciphertext)), decipher.final()]);
    const values: unknown = JSON.parse(plaintext.toString('utf8'));
    if (!values || typeof values !== 'object' || Array.isArray(values)) return unavailable();
    if (!Object.values(values).every((value) => typeof value === 'string')) return unavailable();
    return Object.assign(Object.create(null), values) as CredentialValues;
  } catch {
    return unavailable();
  } finally {
    key.fill(0);
    plaintext?.fill(0);
  }
};
