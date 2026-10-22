import { createCipheriv, randomBytes } from 'node:crypto';
import { decryptValues, encryptValues, readVaultKey } from '../crypto';
import { CredentialsError } from '../types';
import type { CredentialEnvelope, CredentialInput } from '../types';
import { prepareCredential } from '../validation';
import { hashConsumerToken, issueConsumerToken, parseConsumerToken } from '../tokens';

const environment = {
  CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 7).toString('base64'),
  CREDENTIALS_VAULT_KEY_ID: 'test-v1',
};
const input = (): CredentialInput => ({
  name: 'Test AI', templateId: 'ai-api-key', category: 'ai', fields: [
    { key: 'provider', action: 'replace', value: 'synthetic-provider' },
    { key: 'apiKey', action: 'replace', value: 'synthetic-secret' },
  ],
});

describe('vault authenticated encryption', () => {
  it('uses fresh 96-bit nonces and decrypts a standard AES-256-GCM envelope', () => {
    const values = { apiKey: 'synthetic-secret', endpoint: 'https://example.invalid' };
    const first = encryptValues(values, 'tenant-a', 'record-a', environment);
    const second = encryptValues(values, 'tenant-a', 'record-a', environment);
    expect(first.nonce).not.toBe(second.nonce);
    expect(Buffer.from(first.nonce, 'base64')).toHaveLength(12);
    expect(Buffer.from(first.tag, 'base64')).toHaveLength(16);
    expect(JSON.stringify(first)).not.toContain(values.apiKey);
    expect(decryptValues(first, 'tenant-a', 'record-a', environment)).toEqual(values);

    const nonce = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(environment.CREDENTIALS_VAULT_KEY, 'base64'), nonce);
    cipher.setAAD(Buffer.from(JSON.stringify(['erxes.credentials', 1, 'test-v1', 'tenant-a', 'record-a'])));
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(values)), cipher.final()]);
    expect(decryptValues({ version: 1, keyId: 'test-v1', nonce: nonce.toString('base64'),
      ciphertext: ciphertext.toString('base64'), tag: cipher.getAuthTag().toString('base64'),
    }, 'tenant-a', 'record-a', environment)).toEqual(values);
  });

  it.each([
    {},
    { CREDENTIALS_VAULT_KEY: environment.CREDENTIALS_VAULT_KEY },
    { ...environment, CREDENTIALS_VAULT_KEY: 'not-base64' },
    { ...environment, CREDENTIALS_VAULT_KEY: Buffer.alloc(31).toString('base64') },
    { ...environment, CREDENTIALS_VAULT_KEY_ID: 'invalid key id' },
  ])('fails closed on absent or invalid provisioning (%#)', (configuration) => {
    expect(() => readVaultKey(configuration)).toThrow('Credentials operation unavailable');
    expect(() => encryptValues({ apiKey: 'synthetic-secret' }, 'tenant-a', 'record-a', configuration)).toThrow(CredentialsError);
  });

  it('rejects wrong key, wrong key id, tenant, and record without exposing values', () => {
    const envelope = encryptValues({ apiKey: 'synthetic-secret' }, 'tenant-a', 'record-a', environment);
    for (const [tenant, recordId, configuration] of [
      ['tenant-b', 'record-a', environment],
      ['tenant-a', 'record-b', environment],
      ['tenant-a', 'record-a', {}],
      ['tenant-a', 'record-a', { ...environment, CREDENTIALS_VAULT_KEY_ID: 'test-v2' }],
      ['tenant-a', 'record-a', { ...environment, CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 8).toString('base64') }],
    ] as const) {
      expect(() => decryptValues(envelope, tenant, recordId, configuration)).toThrow('Credentials operation unavailable');
    }
  });

  it.each(['nonce', 'ciphertext', 'tag'] as const)('rejects %s tampering and malformed encoding', (key) => {
    const envelope = encryptValues({ apiKey: 'synthetic-secret' }, 'tenant-a', 'record-a', environment);
    const bytes = Buffer.from(envelope[key], 'base64');
    bytes[0] ^= 1;
    for (const value of [bytes.toString('base64'), '!!', '', `${envelope[key]}=`]) {
      expect(() => decryptValues({ ...envelope, [key]: value }, 'tenant-a', 'record-a', environment)).toThrow(CredentialsError);
    }
  });

  it('rejects unknown envelope versions', () => {
    const envelope: CredentialEnvelope = encryptValues({}, 'tenant-a', 'record-a', environment);
    expect(() => decryptValues({ ...envelope, version: 2 }, 'tenant-a', 'record-a', environment)).toThrow(CredentialsError);
  });
});

describe('credential input validation', () => {
  it('keeps, replaces and clears independently while template descriptors remain authoritative', () => {
    const prepared = prepareCredential(input());
    const existing = { ...prepared, _id: 'test', reference: 'cred_test', createdAt: new Date(), updatedAt: new Date() };
    const updated = prepareCredential({ ...input(), fields: [
      { key: 'provider', action: 'keep' },
      { key: 'apiKey', action: 'replace', value: 'replacement-secret', type: 'text', secret: false },
      { key: 'baseUrl', action: 'clear' },
    ] }, existing, { ...prepared.values, baseUrl: 'https://example.invalid' });
    expect(updated.values).toEqual({ provider: 'synthetic-provider', apiKey: 'replacement-secret' });
    expect(updated.fields.find((field) => field.key === 'apiKey')).toMatchObject({ type: 'password', secret: true, required: true });
    expect(updated.fields.find((field) => field.key === 'baseUrl')?.hasValue).toBe(false);
  });

  it.each([
    { name: ' ' }, { name: 'x'.repeat(121) }, { description: '\u0000' },
    { templateId: 'unknown' }, { category: 'wrong' }, { fields: [] },
    { fields: [{ key: 'apiKey', action: 'keep' }] },
    { fields: [{ key: 'apiKey', action: 'clear' }] },
    { fields: [{ key: 'extra', action: 'replace', value: 'test' }] },
    { fields: [{ key: '__proto__', action: 'replace', value: 'test' }] },
    { fields: [{ key: 'apiKey', action: 'replace', value: 'x'.repeat(16385) }] },
    { fields: [{ key: 'apiKey', action: 'replace', value: '\u0000' }] },
    { fields: [{ key: 'provider', action: 'replace', value: 'one' }, { key: 'provider', action: 'replace', value: 'two' }] },
  ])('rejects malformed or incomplete input (%#)', (changes) => {
    expect(() => prepareCredential({ ...input(), ...changes })).toThrow('Invalid credential input');
  });

  it('rejects placeholders attached to keep/clear and immutable template changes', () => {
    const prepared = prepareCredential(input());
    const existing = { ...prepared, _id: 'test', reference: 'cred_test', createdAt: new Date(), updatedAt: new Date() };
    for (const action of ['keep', 'clear']) {
      expect(() => prepareCredential({ ...input(), fields: [{ key: 'baseUrl', action, value: '*****' }] }, existing, prepared.values)).toThrow(CredentialsError);
    }
    expect(() => prepareCredential({ ...input(), templateId: 'generic' }, existing, prepared.values)).toThrow(CredentialsError);
  });

  it.each([
    ['number', 'NaN'], ['number', 'Infinity'], ['boolean', 'yes'],
    ['url', 'file:///test'], ['url', 'https://user:pass@example.invalid'],
  ])('validates %s values', (type, value) => {
    expect(() => prepareCredential({ name: 'Custom', templateId: 'generic', category: 'future',
      fields: [{ key: 'test', type, action: 'replace', value }],
    })).toThrow(CredentialsError);
  });

  it('bounds the UTF-8 payload in bytes so every accepted value can be decrypted', () => {
    const large: CredentialInput = { name: 'Custom', templateId: 'generic', category: 'future',
      fields: Array.from({ length: 10 }, (_, index) => ({ key: `field${index}`, action: 'replace', value: '界'.repeat(10000) })),
    };
    expect(() => prepareCredential(large)).toThrow(CredentialsError);
    const prepared = prepareCredential({ ...large, fields: large.fields.slice(0, 4) });
    expect(decryptValues(encryptValues(prepared.values, 'tenant-a', 'record-a', environment), 'tenant-a', 'record-a', environment)).toEqual(prepared.values);
  });
});

describe('consumer capability tokens', () => {
  it('issues unique 256-bit tokens with a tenant locator and hashes the entire token', () => {
    const token = issueConsumerToken('tenant-a');
    expect(token).not.toBe(issueConsumerToken('tenant-a'));
    expect(Buffer.from(token.split('.')[2], 'base64url')).toHaveLength(32);
    expect(parseConsumerToken(token)).toEqual({ tenant: 'tenant-a', tokenHash: hashConsumerToken(token) });
    expect(hashConsumerToken(token)).not.toContain(token);
  });

  it.each(['', 'garbage', 'ecv1.dGVuYW50LWE.short', 'ecv1.Li4u.' + 'a'.repeat(43)])('rejects malformed tokens (%#)', (token) => {
    expect(() => parseConsumerToken(token)).toThrow('Credential access denied');
  });
});
