import express from 'express';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { generateModels } from '~/connectionResolvers';
import { credentialsRouter } from '../routes';
import { createCredentialStore } from '../store';
import type { CredentialStore } from '../store';
import { encryptValues } from '../crypto';
import { hashConsumerToken, issueConsumerToken } from '../tokens';
import type { StoredCredential, StoredCredentialGrant } from '../types';
import { getCredentialValue } from 'erxes-api-shared/utils';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn(async () => ({})) }));
jest.mock('../store', () => ({ createCredentialStore: jest.fn() }));
jest.mock('../audit', () => ({ auditCredentialEvent: jest.fn(async () => undefined) }));
// Test the current public helper implementation, not another checkout's bundle.
jest.mock('erxes-api-shared/utils', () =>
  jest.requireActual('../../../../../erxes-api-shared/src/utils/credentials'));

const token = issueConsumerToken('tenant-a');
const reference = 'cred_11111111-1111-4111-8111-111111111111';
const environment = {
  CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 7).toString('base64'),
  CREDENTIALS_VAULT_KEY_ID: 'test-v1',
};
const previousEnvironment = {
  CREDENTIALS_VAULT_KEY: process.env.CREDENTIALS_VAULT_KEY,
  CREDENTIALS_VAULT_KEY_ID: process.env.CREDENTIALS_VAULT_KEY_ID,
};
let server: Server;
let baseUrl: string;
let record: StoredCredential;
let grant: StoredCredentialGrant;
let store: CredentialStore;

beforeAll(async () => {
  const app = express();
  app.use('/credentials', credentialsRouter);
  server = createServer(app);
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test listener');
  baseUrl = `http://127.0.0.1:${address.port}/credentials`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => { server.close((error) => error ? reject(error) : resolve()); });
  for (const key of ['CREDENTIALS_VAULT_KEY', 'CREDENTIALS_VAULT_KEY_ID'] as const) {
    const previous = previousEnvironment[key];
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
});
beforeEach(() => {
  Object.assign(process.env, environment);
  record = { _id: 'record-a', tenant: 'tenant-a', reference, name: 'Test', description: '',
    templateId: 'generic', category: 'custom', fields: [], createdAt: new Date(), updatedAt: new Date(), revision: 0,
    encryptedValues: encryptValues({ apiKey: 'synthetic-secret' }, 'tenant-a', 'record-a', environment),
  };
  grant = { _id: 'grant-a', tenant: 'tenant-a', credentialId: record._id, pluginName: 'testplugin', name: 'Test',
    tokenHash: hashConsumerToken(token), createdAt: new Date(), revokedAt: null,
  };
  store = {
    list: jest.fn(async () => []), find: jest.fn(async () => record), findReference: jest.fn(async () => record),
    create: jest.fn(async () => undefined), update: jest.fn(async () => true), remove: jest.fn(async () => true),
    grants: jest.fn(async () => []), createGrant: jest.fn(async () => undefined),
    findGrant: jest.fn(async (hash) => hash === grant.tokenHash && !grant.revokedAt ? grant : null),
    revokeGrant: jest.fn(async () => null), revokeCredentialGrants: jest.fn(async () => undefined),
  };
  jest.mocked(createCredentialStore).mockReturnValue(store);
});

const request = (body: string, authorization = `Bearer ${token}`, headers: Record<string, string> = {}) =>
  fetch(`${baseUrl}/consume`, { method: 'POST', headers: { 'Content-Type': 'application/json', authorization, ...headers }, body });

describe('backend-only credential consumption HTTP boundary', () => {
  it('supports the shared server helper over the real HTTP and crypto boundary', async () => {
    await expect(getCredentialValue('apiKey', {
      endpoint: new URL(baseUrl).origin,
      reference,
      token,
      templateId: 'generic',
    })).resolves.toBe('synthetic-secret');
    expect(generateModels).toHaveBeenCalledWith('tenant-a');
  });

  it('denies subsequent shared-helper reads after the grant is revoked', async () => {
    const options = { endpoint: new URL(baseUrl).origin, reference, token };
    await expect(getCredentialValue('apiKey', options)).resolves.toBe('synthetic-secret');
    grant.revokedAt = new Date();
    await expect(getCredentialValue('apiKey', options)).rejects.toThrow(/^Credential unavailable$/);
  });

  it('returns secrets only to the exact granted capability and ignores caller tenant/plugin headers', async () => {
    const response = await request(JSON.stringify({ reference }), undefined, { subdomain: 'tenant-b', 'x-plugin-name': 'otherplugin' });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(await response.json()).toEqual({ reference, templateId: 'generic', values: { apiKey: 'synthetic-secret' } });
    expect(generateModels).toHaveBeenCalledWith('tenant-a');
    expect(createCredentialStore).toHaveBeenCalledWith({}, 'tenant-a');
  });

  it.each([
    ['missing authorization', JSON.stringify({ reference }), ''],
    ['malformed authorization', JSON.stringify({ reference }), 'Bearer not-a-token'],
    ['invalid JSON', '{"reference":"synthetic-secret"', undefined],
    ['oversized body', JSON.stringify({ reference: 'synthetic-secret'.repeat(200) }), undefined],
    ['extra parameters', JSON.stringify({ reference, tenant: 'tenant-b' }), undefined],
    ['array body', JSON.stringify([reference]), undefined],
  ])('denies %s with no-store and no echoed input', async (_name, body, authorization) => {
    const response = await request(body, authorization);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('{"error":"Credential access denied"}');
    expect(generateModels).not.toHaveBeenCalled();
  });

  it.each(['revoked', 'deleted', 'tampered', 'wrong-key', 'missing-key', 'database'])(
    'fails closed for %s without propagating sensitive errors', async (condition) => {
      if (condition === 'revoked') grant.revokedAt = new Date();
      if (condition === 'deleted') store.findReference = jest.fn(async () => null);
      if (condition === 'tampered') record.encryptedValues.tag = Buffer.alloc(16).toString('base64');
      if (condition === 'wrong-key') process.env.CREDENTIALS_VAULT_KEY = Buffer.alloc(32, 8).toString('base64');
      if (condition === 'missing-key') delete process.env.CREDENTIALS_VAULT_KEY;
      if (condition === 'database') store.findGrant = jest.fn(async () => { throw new Error('synthetic-secret database failure'); });
      const response = await request(JSON.stringify({ reference }));
      expect(response.status).toBe(403);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(await response.json()).toEqual({ error: 'Credential access denied' });
    },
  );

  it('rejects GET and unknown paths without accessing models', async () => {
    for (const path of ['/consume', '/unknown']) {
      const response = await fetch(`${baseUrl}${path}`);
      expect(response.status).toBe(404);
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    expect(generateModels).not.toHaveBeenCalled();
  });
});
