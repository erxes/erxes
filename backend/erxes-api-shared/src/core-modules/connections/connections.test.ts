import { createServiceToken } from '../../utils/service-signature';
import {
  CUSTOM_CONNECTION_TYPE_ID,
  defineConnectionType,
  describeConnectionType,
} from './constants';
import { getConnection, resolveConnection } from './client';
import { runConnectionTest } from './init';
import {
  getLocalConnectionType,
  registerConnections,
  resetConnectionsRegistration,
} from './registry';
import {
  createConnectionReadToken,
  createConnectionTestToken,
  readConnectionReadToken,
  readConnectionTestToken,
} from './tokens';

jest.mock('../../utils/trpc', () => ({
  sendTRPCMessage: jest.fn(),
  createTRPCContext: jest.fn(),
}));

jest.mock('../../utils/service-discovery', () => ({
  initializePluginConfig: jest.fn(),
}));

const connection = {
  _id: 'c1',
  name: 'OpenAI',
  type: 'ai:provider',
  fields: { baseUrl: 'https://api.example.com/v1', apiKey: 'sk-secret' },
};

const providerType = defineConnectionType({
  id: 'provider',
  label: 'AI provider',
  icon: 'IconSparkles',
  fields: [
    { key: 'baseUrl', label: 'Base URL', required: true, inputType: 'url' },
    { key: 'apiKey', label: 'API key', required: true, secret: true },
  ],
  test: async ({ fields }) => ({ ok: fields.apiKey === 'sk-secret' }),
  resolve: ({ fields }) => ({ baseURL: fields.baseUrl, apiKey: fields.apiKey }),
});

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = 'connections-test-secret';
  resetConnectionsRegistration();
});

afterEach(() => {
  delete process.env.JWT_TOKEN_SECRET;
});

describe('connection type registration', () => {
  it('describes a valid type with its full id and resolver flags', () => {
    expect(describeConnectionType('ai', providerType)).toMatchObject({
      id: 'ai:provider',
      pluginName: 'ai',
      hasTest: true,
      hasResolve: true,
      allowCustomFields: false,
    });
  });

  it('rejects invalid ids, field keys and duplicate keys', () => {
    expect(() =>
      describeConnectionType('ai', { ...providerType, id: 'Bad id' }),
    ).toThrow(/Invalid connection type/);
    expect(() =>
      describeConnectionType('ai', {
        ...providerType,
        fields: [{ key: '1st', label: 'First' }],
      }),
    ).toThrow(/Invalid connection type/);
    expect(() =>
      describeConnectionType('ai', {
        ...providerType,
        fields: [
          { key: 'a', label: 'A' },
          { key: 'a', label: 'Again' },
        ],
      }),
    ).toThrow(/unique/);
  });

  it('records local types and validates the allow-list', () => {
    const registration = registerConnections('ai', {
      types: [providerType],
      uses: [CUSTOM_CONNECTION_TYPE_ID, CUSTOM_CONNECTION_TYPE_ID],
    });

    expect(registration.types.map((type) => type.id)).toEqual(['ai:provider']);
    expect(registration.uses).toEqual([CUSTOM_CONNECTION_TYPE_ID]);
    expect(getLocalConnectionType('ai:provider')).toBe(providerType);
    expect(getLocalConnectionType(CUSTOM_CONNECTION_TYPE_ID)?.id).toBe(
      'custom',
    );
    expect(() => registerConnections('ai', { uses: ['custom'] })).toThrow(
      /Invalid connection type id/,
    );
  });
});

describe('connection tokens', () => {
  const request = {
    subdomain: 'tenant',
    service: 'ai',
    lookup: { type: 'ai:provider', name: 'OpenAI' },
  };

  it('round-trips a read request', () => {
    expect(readConnectionReadToken(createConnectionReadToken(request))).toEqual(
      request,
    );
  });

  it('never accepts a token minted for another purpose', () => {
    const testToken = createConnectionTestToken('tenant', connection);

    expect(readConnectionReadToken(testToken)).toBeNull();
    expect(readConnectionTestToken(createConnectionReadToken(request))).toBeNull();
    expect(
      readConnectionReadToken(createServiceToken(request, 'other-purpose')),
    ).toBeNull();
  });

  it('rejects tampered, expired and unsigned tokens', () => {
    const token = createConnectionReadToken(request);
    const [, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ ...request, service: 'sales', at: Date.now() }),
    ).toString('base64url');

    expect(readConnectionReadToken(`${forged}.${signature}`)).toBeNull();
    expect(readConnectionReadToken('not-a-token')).toBeNull();

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 2 * 60 * 1000);
    expect(readConnectionReadToken(token)).toBeNull();
    jest.restoreAllMocks();

    delete process.env.JWT_TOKEN_SECRET;
    expect(readConnectionReadToken(token)).toBeNull();
  });

  it('cannot be minted without the service secret', () => {
    delete process.env.JWT_TOKEN_SECRET;

    expect(() => createConnectionReadToken(request)).toThrow(/JWT_TOKEN_SECRET/);
  });

});

describe('getConnection / resolveConnection', () => {
  it('refuses to read before the service declares meta.connections', async () => {
    await expect(
      getConnection({ subdomain: 'tenant', type: 'ai:provider', name: 'x' }),
    ).rejects.toThrow(/Declare meta.connections/);
  });

  it('refuses to resolve a type without a resolver here', async () => {
    registerConnections('ai', { uses: ['sales:mail'] });

    await expect(
      resolveConnection({ subdomain: 'tenant', type: 'sales:mail', name: 'x' }),
    ).rejects.toThrow(/has no resolver/);
  });
});

describe('runConnectionTest', () => {
  beforeEach(() => registerConnections('ai', { types: [providerType] }));

  it('runs the type test for a valid token', async () => {
    const token = createConnectionTestToken('tenant', connection);

    await expect(runConnectionTest(token, 'tenant')).resolves.toEqual({
      ok: true,
      message: undefined,
    });
  });

  it('rejects another tenant and invalid tokens', async () => {
    const token = createConnectionTestToken('tenant', connection);

    await expect(runConnectionTest(token, 'other')).rejects.toThrow(
      'Invalid request',
    );
    await expect(runConnectionTest('forged', 'tenant')).rejects.toThrow(
      'Invalid request',
    );
  });

  it('turns a thrown error into a fixed message', async () => {
    registerConnections('ai', {
      types: [
        {
          ...providerType,
          test: () => {
            throw new Error('GET https://x?key=sk-secret failed');
          },
        },
      ],
    });
    const token = createConnectionTestToken('tenant', connection);

    const result = await runConnectionTest(token, 'tenant');

    expect(result).toEqual({
      ok: false,
      message: 'The connection test failed.',
    });
    expect(JSON.stringify(result)).not.toContain('sk-secret');
  });
});
