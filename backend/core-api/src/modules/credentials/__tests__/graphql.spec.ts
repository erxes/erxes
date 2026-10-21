import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import * as jwt from 'jsonwebtoken';
import { redis } from 'erxes-api-shared/utils';
import { credentialsQueries, credentialsMutations } from '../graphql/resolvers';
import { types, queries, mutations } from '../graphql/schema';
import { createCredentialStore } from '../store';
import type { CredentialStore } from '../store';

jest.mock('erxes-api-shared/utils', () => ({
  redis: { get: jest.fn() }, logHandler: jest.fn(async () => undefined),
}), { virtual: true });
jest.mock('../store', () => ({ createCredentialStore: jest.fn() }));

const schema = makeExecutableSchema({
  typeDefs: `scalar Date\n${types}\ntype Query { ${queries} }\ntype Mutation { ${mutations} }`,
  resolvers: { Query: credentialsQueries, Mutation: credentialsMutations },
});
const sessionSecret = 'synthetic-session-signing-key-for-tests';
const previousSecret = process.env.JWT_TOKEN_SECRET;

const fixture = () => {
  const session = jwt.sign({ user: { _id: 'user-a', isOwner: true } }, sessionSecret, { expiresIn: '5m' });
  const principal = { _id: 'user-a', isActive: true, isOwner: false, customPermissions: [{
    plugin: 'core', module: 'credentials', scope: 'all', actions: ['credentialsRead'],
  }] };
  const context = {
    subdomain: 'tenant-a', user: { _id: 'forged-owner', isOwner: true },
    req: { headers: { authorization: `Bearer ${session}` }, cookies: {} },
    res: { setHeader: jest.fn() },
    models: {
      Users: { findOne: jest.fn(() => ({ select: () => ({ lean: async () => principal }) })) },
      PermissionGroups: { find: jest.fn(() => ({ select: () => ({ lean: async () => [] }) })) },
    },
  };
  const metadata = { _id: 'record-a', tenant: 'tenant-a', reference: 'cred_test', name: 'Test', description: '',
    category: 'custom', templateId: 'generic', fields: [], createdAt: new Date(), updatedAt: new Date(),
    revision: 0, encryptedValues: { version: 1, keyId: 'test-v1', nonce: '', tag: '', ciphertext: '' },
  };
  const store: CredentialStore = {
    find: jest.fn(async () => metadata),
    findReference: jest.fn(async () => metadata),
    list: jest.fn(async () => [metadata]),
    create: jest.fn(async () => undefined),
    update: jest.fn(async () => true),
    remove: jest.fn(async () => true),
    createGrant: jest.fn(async () => undefined),
    findGrant: jest.fn(async () => null),
    revokeGrant: jest.fn(async () => null),
    revokeCredentialGrants: jest.fn(async () => undefined),
    grants: jest.fn(async () => [{ _id: 'grant-a', credentialId: 'record-a', pluginName: 'testplugin',
      name: 'Test', tenant: 'tenant-a', tokenHash: 'must-never-return', createdAt: new Date(),
    }]),
  };
  jest.mocked(createCredentialStore).mockReturnValue(store);
  return { context, principal, store, session };
};

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = sessionSecret;
  jest.mocked(redis.get).mockResolvedValue('1');
});
afterAll(() => {
  if (previousSecret === undefined) delete process.env.JWT_TOKEN_SECRET;
  else process.env.JWT_TOKEN_SECRET = previousSecret;
});

describe('credential GraphQL management boundary', () => {
  it('authenticates the real session, reads current tenant permissions, and permits grant metadata with read permission', async () => {
    const { context, session } = fixture();
    const result = await graphql({ schema, contextValue: context, source: `query {
      credentialsList { _id reference fields { key hasValue } }
      credentialsGrants(credentialId: "record-a") { _id pluginName name }
    }` });
    expect(result.errors).toBeUndefined();
    expect(JSON.stringify(result)).not.toMatch(/must-never-return|tokenHash/);
    expect(context.models.Users.findOne).toHaveBeenCalledWith({ _id: 'user-a', isActive: true });
    expect(redis.get).toHaveBeenCalledWith(`user_token_user-a_${session}`);
    expect(context.res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });

  it.each([
    'credentialsDelete(_id: "record-a")',
    'credentialsGrantCreate(credentialId: "record-a", pluginName: "testplugin", name: "Test") { token }',
    'credentialsGrantRevoke(_id: "grant-a")',
  ])('denies writes without their specific permission (%#)', async (operation) => {
    const { context } = fixture();
    const result = await graphql({ schema, contextValue: context, source: `mutation { ${operation} }` });
    expect(result.errors?.[0].extensions.code).toBe('CREDENTIALS_FORBIDDEN');
    expect(createCredentialStore).not.toHaveBeenCalled();
  });

  it.each(['missing', 'forged', 'expired', 'oauth', 'revoked', 'inactive', 'portal', 'app', 'no-key'])(
    'denies %s authentication before accessing the vault', async (variant) => {
      const { context, principal } = fixture();
      if (variant === 'missing') context.req.headers.authorization = '';
      if (variant === 'forged') context.req.headers.authorization = `Bearer ${jwt.sign({ user: { _id: 'user-a' } }, 'other-key', { expiresIn: '5m' })}`;
      if (variant === 'expired') context.req.headers.authorization = `Bearer ${jwt.sign({ user: { _id: 'user-a' } }, sessionSecret, { expiresIn: -1 })}`;
      if (variant === 'oauth') context.req.headers.authorization = `Bearer ${jwt.sign({ typ: 'oauth_access', user: { _id: 'user-a' } }, sessionSecret, { expiresIn: '5m' })}`;
      if (variant === 'revoked') jest.mocked(redis.get).mockResolvedValue(null);
      if (variant === 'inactive') principal.isActive = false;
      if (variant === 'portal') Object.assign(context, { cpUser: { _id: 'portal-user' } });
      if (variant === 'app') Object.assign(context.user, { appId: 'app' });
      if (variant === 'no-key') delete process.env.JWT_TOKEN_SECRET;
      const result = await graphql({ schema, contextValue: context, source: '{ credentialsTemplates { id } }' });
      expect(result.errors).toHaveLength(1);
      expect(createCredentialStore).not.toHaveBeenCalled();
      expect(context.res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    },
  );

  it('does not trust forwarded ownership or retain revoked permissions', async () => {
    const { context, principal } = fixture();
    principal.customPermissions = [];
    const result = await graphql({ schema, contextValue: context, source: '{ credentialsTemplates { id } }' });
    expect(result.errors?.[0].extensions.code).toBe('CREDENTIALS_FORBIDDEN');
    expect(createCredentialStore).not.toHaveBeenCalled();
  });

  it('sanitizes database/JWT exceptions and exposes no value/envelope/hash read fields', async () => {
    const { context } = fixture();
    context.models.Users.findOne.mockImplementation(() => { throw new Error('synthetic-secret database error'); });
    const result = await graphql({ schema, contextValue: context, source: '{ credentialsTemplates { id } }' });
    expect(result.errors?.[0].message).toBe('Credentials operation unavailable');
    expect(JSON.stringify(result)).not.toContain('synthetic-secret');
    for (const source of [
      '{ credentialsDetail(_id: "record-a") { values encryptedValues } }',
      '{ credentialsGrants(credentialId: "record-a") { tokenHash token } }',
      '{ credentialsDetail(_id: "record-a") { fields { value } } }',
    ]) {
      const invalid = await graphql({ schema, source });
      expect(invalid.errors?.length).toBeGreaterThan(0);
    }
  });
});
