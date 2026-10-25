/**
 * Connections module — security contract.
 *
 * Real sealing, validation, registry, model statics (over an in-memory
 * collection), GraphQL schema and the shared resolver wrapper. Only service
 * discovery, the log queue and tRPC transport are replaced.
 */
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import {
  createConnectionReadToken,
  CUSTOM_CONNECTION_TYPE_ID,
} from 'erxes-api-shared/core-modules';
import { IConnectionField } from '@/connections/@types/connection';
import {
  mutations,
  queries,
  types,
} from '@/connections/graphql/schema';
import {
  connectionCustomResolvers,
  connectionMutations,
  connectionQueries,
} from '@/connections/graphql/resolvers';
import {
  canServiceReadType,
  getConnectionTypes,
} from '@/connections/registry';
import {
  isSealedConnectionValue,
  openConnectionValue,
  sealConnectionValue,
} from '@/connections/sealing';
import {
  readConnection,
  readConnectionForService,
  testConnection,
} from '@/connections/service';
import { buildConnectionFields } from '@/connections/validation';
import { createMemoryModels } from './memoryModels';

process.env.JWT_TOKEN_SECRET ??= 'connections-test-secret';

jest.mock('erxes-api-shared/utils', () => {
  const { ExpectedError } = jest.requireActual(
    'erxes-api-shared/utils/errorClassifier',
  );
  const { markResolvers, wrapApolloResolvers } = jest.requireActual(
    'erxes-api-shared/utils/apollo/wrapperResolvers',
  );

  const { mongooseStringRandomId } = jest.requireActual(
    'erxes-api-shared/utils/mongo/mongoose-types',
  );
  const { schemaWrapper } = jest.requireActual(
    'erxes-api-shared/utils/mongo/mongoose-utils',
  );

  return {
    ExpectedError,
    mongooseStringRandomId,
    schemaWrapper,
    markResolvers,
    wrapApolloResolvers,
    escapeRegExp: (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    logHandler: (...args: unknown[]) =>
      jest.requireMock('erxes-api-shared/utils/logs').logHandler(...args),
    sendCoreModuleProducer: jest.fn(),
    getAvailablePlugins: jest.fn(),
    getPlugin: jest.fn(),
  };
});

jest.mock('erxes-api-shared/utils/logs', () => ({
  logHandler: jest.fn(async (resolver: () => unknown) => resolver()),
}));

jest.mock('erxes-api-shared/utils/apollo/runBeforeResolvers', () => ({
  runBeforeResolvers: jest.fn(async (_key: string, args: unknown) => ({
    resolved: false,
    args,
  })),
}));

jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/connections'),
);

jest.mock('erxes-api-shared/utils/trpc', () => ({
  sendTRPCMessage: jest.fn(),
  createTRPCContext: jest.fn(),
}));

jest.mock('erxes-api-shared/utils/service-discovery', () => ({
  initializePluginConfig: jest.fn(),
}));

const utils = jest.requireMock('erxes-api-shared/utils') as {
  getAvailablePlugins: jest.Mock;
  getPlugin: jest.Mock;
  sendCoreModuleProducer: jest.Mock;
};
const { logHandler } = jest.requireMock('erxes-api-shared/utils/logs') as {
  logHandler: jest.Mock;
};
const { runBeforeResolvers } = jest.requireMock(
  'erxes-api-shared/utils/apollo/runBeforeResolvers',
) as { runBeforeResolvers: jest.Mock };

const SECRET = 'sk-very-secret-value';

const storedValue = (fields: IConnectionField[], key: string) => {
  const field = fields.find((entry) => entry.key === key);

  if (!field) {
    throw new Error(`No stored field ${key}`);
  }

  return field.value;
};

const aiRegistration = {
  types: [
    {
      id: 'ai:provider',
      pluginName: 'ai',
      label: 'AI provider',
      icon: 'IconSparkles',
      fields: [
        { key: 'baseUrl', label: 'Base URL', required: true, inputType: 'url' },
        { key: 'apiKey', label: 'API key', required: true, secret: true },
      ],
      allowCustomFields: false,
      hasTest: true,
      hasResolve: true,
    },
    // Not namespaced by its publisher: ignored.
    {
      id: 'sales:shadow',
      pluginName: 'ai',
      label: 'Shadow',
      icon: 'IconPlug',
      fields: [],
      allowCustomFields: true,
      hasTest: false,
      hasResolve: false,
    },
  ],
  uses: [CUSTOM_CONNECTION_TYPE_ID],
};

const registrations: Record<string, unknown> = {
  ai: aiRegistration,
  sales: { types: [], uses: [] },
};

beforeEach(() => {
  // Envelopes that must not open log a fixed warning.
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  logHandler.mockClear();
  runBeforeResolvers.mockClear();
  utils.sendCoreModuleProducer.mockReset();
  utils.getAvailablePlugins.mockResolvedValue(['core', 'ai', 'sales']);
  utils.getPlugin.mockImplementation(async (name: string) => ({
    address: `http://${name}`,
    config: { meta: { connections: registrations[name] } },
  }));
});

describe('sealing', () => {
  it('seals with a binding to the connection and key', () => {
    const sealed = sealConnectionValue('c1', 'apiKey', SECRET);

    expect(isSealedConnectionValue(sealed)).toBe(true);
    expect(sealed).not.toContain(SECRET);
    expect(openConnectionValue('c1', 'apiKey', sealed)).toBe(SECRET);
    expect(openConnectionValue('c2', 'apiKey', sealed)).toBeNull();
    expect(openConnectionValue('c1', 'other', sealed)).toBeNull();
  });

  it('never treats stored plaintext as a secret', () => {
    expect(openConnectionValue('c1', 'apiKey', SECRET)).toBeNull();
  });

  it('uses a key separate from the agents BYOK box', async () => {
    const { openSecret, sealSecret } = await import('@/agents/secretBox');

    expect(openSecret(sealConnectionValue('c1', 'apiKey', SECRET))).toBeNull();
    expect(openConnectionValue('c1', 'apiKey', sealSecret(SECRET))).toBeNull();
  });
});

describe('field building (custom type)', () => {
  const customType = async () => {
    const descriptor = (await getConnectionTypes('tenant')).find(
      (type) => type.id === CUSTOM_CONNECTION_TYPE_ID,
    );

    if (!descriptor) {
      throw new Error('The custom type is not registered');
    }

    return descriptor;
  };

  it('seals secret keys, stores plain ones as-is', async () => {
    const descriptor = await customType();
    const fields = buildConnectionFields({
      descriptor,
      connectionId: 'c1',
      inputs: [
        { key: 'host', value: 'smtp.example.com' },
        { key: 'password', secret: true, value: SECRET },
      ],
    });

    expect(fields[0]).toEqual({
      key: 'host',
      label: undefined,
      secret: false,
      value: 'smtp.example.com',
    });
    expect(fields[1].secret).toBe(true);
    expect(fields[1].value).not.toContain(SECRET);
    expect(openConnectionValue('c1', 'password', fields[1].value)).toBe(SECRET);
  });

  it('keeps an omitted secret, replaces a given one, drops removed keys', async () => {
    const descriptor = await customType();
    const existing = buildConnectionFields({
      descriptor,
      connectionId: 'c1',
      inputs: [
        { key: 'password', secret: true, value: SECRET },
        { key: 'token', secret: true, value: 'old-token' },
        { key: 'gone', value: 'x' },
      ],
    });

    const next = buildConnectionFields({
      descriptor,
      connectionId: 'c1',
      existing,
      inputs: [
        { key: 'password', secret: true },
        { key: 'token', secret: true, value: 'new-token' },
      ],
    });

    expect(next.map((field) => field.key)).toEqual(['password', 'token']);
    expect(next[0].value).toBe(existing[0].value);
    expect(openConnectionValue('c1', 'token', next[1].value)).toBe('new-token');
  });

  it('requires re-entry when a secret becomes plain, seals plain becoming secret', async () => {
    const descriptor = await customType();
    const existing: IConnectionField[] = buildConnectionFields({
      descriptor,
      connectionId: 'c1',
      inputs: [
        { key: 'password', secret: true, value: SECRET },
        { key: 'host', value: 'smtp.example.com' },
      ],
    });

    expect(() =>
      buildConnectionFields({
        descriptor,
        connectionId: 'c1',
        existing,
        inputs: [{ key: 'password', secret: false }],
      }),
    ).toThrow('Enter a new value for password');

    const [host] = buildConnectionFields({
      descriptor,
      connectionId: 'c1',
      existing,
      inputs: [{ key: 'host', secret: true }],
    });

    expect(openConnectionValue('c1', 'host', host.value)).toBe(
      'smtp.example.com',
    );
  });

  it('rejects invalid and duplicate keys', async () => {
    const descriptor = await customType();

    expect(() =>
      buildConnectionFields({
        descriptor,
        connectionId: 'c1',
        inputs: [{ key: '1bad', value: 'x' }],
      }),
    ).toThrow(/Keys start with a letter/);
    expect(() =>
      buildConnectionFields({
        descriptor,
        connectionId: 'c1',
        inputs: [
          { key: 'a', value: 'x' },
          { key: 'a', value: 'y' },
        ],
      }),
    ).toThrow(/used twice/);
  });
});

describe('type registry', () => {
  it('lists the built-in custom type and namespaced plugin types', async () => {
    const ids = (await getConnectionTypes('tenant')).map((type) => type.id);

    expect(ids).toEqual([CUSTOM_CONNECTION_TYPE_ID, 'ai:provider']);
  });

  it('hides types of services the tenant cannot use', async () => {
    utils.getAvailablePlugins.mockResolvedValue(['core', 'sales']);

    const ids = (await getConnectionTypes('tenant')).map((type) => type.id);

    expect(ids).toEqual([CUSTOM_CONNECTION_TYPE_ID]);
  });

  it('allows own and declared types only', async () => {
    await expect(canServiceReadType('tenant', 'ai', 'ai:provider')).resolves.toBe(true);
    await expect(
      canServiceReadType('tenant', 'ai', CUSTOM_CONNECTION_TYPE_ID),
    ).resolves.toBe(true);
    await expect(
      canServiceReadType('tenant', 'sales', 'ai:provider'),
    ).resolves.toBe(false);
    await expect(canServiceReadType('tenant', 'ai', 'sales:shadow')).resolves.toBe(
      false,
    );
    await expect(canServiceReadType('tenant', 'core', 'ai:provider')).resolves.toBe(
      false,
    );
    await expect(
      canServiceReadType('tenant', 'unknown', CUSTOM_CONNECTION_TYPE_ID),
    ).resolves.toBe(false);
  });
});

const schema = makeExecutableSchema({
  typeDefs: `
    scalar Date
    type User { _id: String }
    ${types}
    type Query { ${queries} }
    type Mutation { ${mutations} }
  `,
  resolvers: jest
    .requireMock('erxes-api-shared/utils')
    .wrapApolloResolvers({
      Query: connectionQueries,
      Mutation: connectionMutations,
      Connection: connectionCustomResolvers,
    }),
});

const CONNECTION_FIELDS = `
  _id name icon logo type typeLabel status hasTest
  fields { key label secret value hasValue }
`;

const allow = async () => undefined;

const run = async (
  models: ReturnType<typeof createMemoryModels>['models'],
  source: string,
  variableValues?: Record<string, unknown>,
  checkPermission: (action: string) => Promise<void> = allow,
) =>
  graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      models,
      subdomain: 'tenant',
      user: { _id: 'user-1' },
      checkPermission,
      req: { headers: {} },
    },
  });

const ADD = `
  mutation connectionsAdd($input: ConnectionAddInput!) {
    connectionsAdd(input: $input) { ${CONNECTION_FIELDS} }
  }
`;

const addProvider = (models: ReturnType<typeof createMemoryModels>['models'], name = 'OpenAI') =>
  run(models, ADD, {
    input: {
      name,
      icon: 'IconSparkles',
      type: 'ai:provider',
      fields: [
        { key: 'baseUrl', value: 'https://api.example.com/v1' },
        { key: 'apiKey', value: SECRET },
      ],
    },
  });

describe('GraphQL', () => {
  it('never returns or logs secret values', async () => {
    const { models, raw } = createMemoryModels();

    const added = await addProvider(models);

    expect(added.errors).toBeUndefined();
    expect(added.data?.connectionsAdd.fields).toEqual([
      {
        key: 'baseUrl',
        label: 'Base URL',
        secret: false,
        value: 'https://api.example.com/v1',
        hasValue: true,
      },
      { key: 'apiKey', label: 'API key', secret: true, value: null, hasValue: true },
    ]);

    const list = await run(models, `query connections { connections { ${CONNECTION_FIELDS} } }`);
    const detail = await run(
      models,
      `query connectionsDetail($_id: String!) { connectionsDetail(_id: $_id) { ${CONNECTION_FIELDS} } }`,
      { _id: added.data?.connectionsAdd._id },
    );

    const stored = { value: storedValue(raw()[0].fields, 'apiKey') };

    for (const response of [added, list, detail]) {
      const body = JSON.stringify(response);

      expect(body).not.toContain(SECRET);
      expect(body).not.toContain(stored.value);
    }

    // At rest: sealed. In the mutation log: no arguments.
    expect(stored.value).not.toContain(SECRET);
    expect(JSON.stringify(logHandler.mock.calls)).not.toContain(SECRET);
    expect(logHandler.mock.calls[0][1].payload.argsRedacted).toBe(true);
    // Mutation inputs never reach plugin before-resolver hooks.
    expect(
      runBeforeResolvers.mock.calls.map(([key]) => key),
    ).not.toContain('connectionsAdd');
  });

  it('keeps a secret omitted on edit and rejects duplicate names', async () => {
    const { models, raw } = createMemoryModels();
    const added = await addProvider(models);
    const before = storedValue(raw()[0].fields, 'apiKey');

    const edited = await run(
      models,
      `mutation connectionsEdit($_id: String!, $input: ConnectionEditInput!) {
        connectionsEdit(_id: $_id, input: $input) { ${CONNECTION_FIELDS} }
      }`,
      {
        _id: added.data?.connectionsAdd._id,
        input: {
          name: 'OpenAI (prod)',
          fields: [{ key: 'baseUrl', value: 'https://api.example.com/v2' }, { key: 'apiKey' }],
        },
      },
    );

    expect(edited.errors).toBeUndefined();
    expect(storedValue(raw()[0].fields, 'apiKey')).toBe(before);

    await addProvider(models, 'Second');
    const duplicate = await addProvider(models, 'openai (PROD)');

    expect(duplicate.errors?.[0].message).toBe(
      'A connection with this name already exists',
    );
  });

  it('requires a name and an icon or logo', async () => {
    const { models } = createMemoryModels();

    const noIcon = await run(models, ADD, {
      input: { name: 'x', type: CUSTOM_CONNECTION_TYPE_ID },
    });
    const noName = await run(models, ADD, {
      input: { name: '  ', icon: 'IconPlug', type: CUSTOM_CONNECTION_TYPE_ID },
    });
    const withLogo = await run(models, ADD, {
      input: { name: 'Logo only', logo: 'logo.png', type: CUSTOM_CONNECTION_TYPE_ID },
    });

    expect(noIcon.errors?.[0].message).toBe('Choose an icon or upload a logo');
    expect(noName.errors?.[0].message).toBe('Enter a name');
    expect(withLogo.errors).toBeUndefined();
  });

  it('checks permissions before every read and mutation', async () => {
    const { models } = createMemoryModels();
    const added = await addProvider(models);
    const id = added.data?.connectionsAdd._id;
    const checked: string[] = [];
    const deny = async (action: string) => {
      checked.push(action);
      throw new Error('Permission required');
    };

    const operations: [string, Record<string, unknown>?][] = [
      ['query connectionsTypes { connectionsTypes { id } }'],
      ['query connections { connections { _id } }'],
      ['query connectionsDetail($_id: String!) { connectionsDetail(_id: $_id) { _id } }', { _id: id }],
      [ADD, { input: { name: 'n', icon: 'IconPlug', type: CUSTOM_CONNECTION_TYPE_ID } }],
      ['mutation connectionsEdit($_id: String!) { connectionsEdit(_id: $_id, input: { name: "x" }) { _id } }', { _id: id }],
      ['mutation connectionsRemove($_id: String!) { connectionsRemove(_id: $_id) }', { _id: id }],
      ['mutation connectionsTest($_id: String!) { connectionsTest(_id: $_id) { ok } }', { _id: id }],
    ];

    for (const [source, variables] of operations) {
      const result = await run(models, source, variables, deny);

      expect(result.errors?.[0].message).toBe('Permission required');
    }

    expect(checked).toEqual([
      'showConnections',
      'showConnections',
      'showConnections',
      'manageConnections',
      'manageConnections',
      'manageConnections',
      'manageConnections',
    ]);
    expect(utils.sendCoreModuleProducer).not.toHaveBeenCalled();
  });

  it('isolates tenants', async () => {
    const tenantA = createMemoryModels();
    const tenantB = createMemoryModels();
    const added = await addProvider(tenantA.models);

    const list = await run(tenantB.models, 'query connections { connections { _id } }');
    const detail = await run(
      tenantB.models,
      'query connectionsDetail($_id: String!) { connectionsDetail(_id: $_id) { _id } }',
      { _id: added.data?.connectionsAdd._id },
    );

    expect(list.data?.connections).toEqual([]);
    expect(detail.errors?.[0].message).toBe('Connection not found');
  });
});

describe('plugin access', () => {
  const token = (service: string, lookup: Record<string, string>, subdomain = 'tenant') =>
    createConnectionReadToken({
      subdomain,
      service,
      lookup: lookup as { type: string; name: string },
    });

  it('returns the decrypted connection to a declared service and audits it', async () => {
    const { models } = createMemoryModels();
    await addProvider(models);
    logHandler.mockClear();

    const value = await readConnectionForService(
      models,
      'tenant',
      token('ai', { type: 'ai:provider', name: 'openai' }),
    );

    expect(value).toMatchObject({
      name: 'OpenAI',
      type: 'ai:provider',
      fields: { baseUrl: 'https://api.example.com/v1', apiKey: SECRET },
    });

    const [, logDoc, , , skipSaveResult] = logHandler.mock.calls[0];

    expect(logDoc).toMatchObject({
      subdomain: 'tenant',
      source: 'auth',
      action: 'connectionRead',
      payload: { service: 'ai', type: 'ai:provider', name: 'openai' },
    });
    expect(skipSaveResult).toBe(true);
    expect(JSON.stringify(logHandler.mock.calls)).not.toContain(SECRET);
  });

  it('denies undeclared types, other tenants and unsigned requests', async () => {
    const { models } = createMemoryModels();
    await addProvider(models);

    await expect(
      readConnectionForService(
        models,
        'tenant',
        token('sales', { type: 'ai:provider', name: 'OpenAI' }),
      ),
    ).rejects.toThrow('This service has not declared this connection type');

    await expect(
      readConnectionForService(
        models,
        'tenant',
        token('ai', { type: 'ai:provider', name: 'OpenAI' }, 'other-tenant'),
      ),
    ).rejects.toThrow('Invalid request');

    await expect(
      readConnectionForService(models, 'tenant', 'unsigned.token'),
    ).rejects.toThrow('Invalid request');

    // The declared type must also be the connection's type.
    await expect(
      readConnectionForService(
        models,
        'tenant',
        token('ai', { type: CUSTOM_CONNECTION_TYPE_ID, name: 'OpenAI' }),
      ),
    ).rejects.toThrow('Connection not found');
  });

  it('lets core read its own connections with an audit entry', async () => {
    const { models } = createMemoryModels();
    await addProvider(models);
    logHandler.mockClear();

    const value = await readConnection(models, 'tenant', {
      type: 'ai:provider',
      name: 'OpenAI',
    });

    expect(value.fields.apiKey).toBe(SECRET);
    expect(logHandler.mock.calls[0][1].payload.service).toBe('core');
  });
});

describe('connection tests', () => {
  it('asks the owning service with a signed token and records the result', async () => {
    const { models } = createMemoryModels();
    const added = await addProvider(models);
    utils.sendCoreModuleProducer.mockResolvedValue({ ok: false, message: 'Invalid API key' });

    const result = await testConnection(models, 'tenant', added.data?.connectionsAdd._id);

    expect(result.ok).toBe(false);
    expect(result.connection?.status).toBe('failed');
    expect(result.connection?.lastTestMessage).toBe('Invalid API key');

    const [call] = utils.sendCoreModuleProducer.mock.calls[0];

    expect(call).toMatchObject({
      subdomain: 'tenant',
      pluginName: 'ai',
      moduleName: 'connections',
      producerName: 'test',
    });
    expect(JSON.stringify(call.input)).not.toContain(SECRET);
  });

  it('reports an unreachable service without a value', async () => {
    const { models } = createMemoryModels();
    const added = await addProvider(models);
    utils.sendCoreModuleProducer.mockRejectedValue(new Error(`boom ${SECRET}`));

    const result = await testConnection(models, 'tenant', added.data?.connectionsAdd._id);

    expect(result).toMatchObject({
      ok: false,
      message: 'The connection test could not run.',
    });
  });

  it('refuses types without a test', async () => {
    const { models } = createMemoryModels();
    const added = await run(models, ADD, {
      input: { name: 'Custom', icon: 'IconPlug', type: CUSTOM_CONNECTION_TYPE_ID },
    });

    await expect(
      testConnection(models, 'tenant', added.data?.connectionsAdd._id),
    ).rejects.toThrow('This connection type cannot be tested');
  });
});

// Real Mongoose models, unique index and sealed documents at rest, in two
// throwaway databases (one per tenant) that are dropped afterwards. Never the
// developer's data: `generateModels` is not used.
const mongoSuite =
  process.env.CONNECTIONS_MONGO_TESTS === '1' ? describe : describe.skip;

mongoSuite('against isolated MongoDB databases', () => {
  const mongoose = jest.requireActual('mongoose') as typeof import('mongoose');
  const { loadConnectionClass } = jest.requireActual(
    '@/connections/db/models/Connections',
  ) as typeof import('@/connections/db/models/Connections');
  const baseUrl =
    process.env.CONNECTIONS_TEST_MONGO_URL || 'mongodb://127.0.0.1:27017';
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const tenants: {
    connection: import('mongoose').Connection;
    models: ReturnType<typeof createMemoryModels>['models'];
  }[] = [];

  beforeAll(async () => {
    for (const name of ['a', 'b']) {
      const connection = await mongoose
        .createConnection(`${baseUrl}/erxes_connections_test_${suffix}_${name}`, {
          serverSelectionTimeoutMS: 3000,
        })
        .asPromise();
      const models = {
        Users: { findOne: async () => null },
      } as unknown as ReturnType<typeof createMemoryModels>['models'];

      models.Connections = connection.model(
        'connections',
        loadConnectionClass(models),
      ) as unknown as typeof models.Connections;
      await models.Connections.init();
      tenants.push({ connection, models });
    }
  });

  afterAll(async () => {
    for (const { connection } of tenants) {
      await connection.dropDatabase();
      await connection.close();
    }
  });

  it('stores secrets sealed, enforces names and keeps tenants apart', async () => {
    const [a, b] = tenants;
    const added = await addProvider(a.models);
    const id = added.data?.connectionsAdd._id;

    expect(added.errors).toBeUndefined();

    const rawDoc = await a.connection.collection('connections').findOne({ _id: id });

    expect(JSON.stringify(rawDoc)).not.toContain(SECRET);
    expect(
      rawDoc?.fields.find((field: IConnectionField) => field.key === 'apiKey').value,
    ).toMatch(/^enc:v1:/);

    const duplicate = await addProvider(a.models, 'OPENAI');

    expect(duplicate.errors?.[0].message).toBe(
      'A connection with this name already exists',
    );

    const edited = await run(
      a.models,
      `mutation connectionsEdit($_id: String!, $input: ConnectionEditInput!) {
        connectionsEdit(_id: $_id, input: $input) { _id }
      }`,
      { _id: id, input: { fields: [{ key: 'baseUrl', value: 'https://x.example.com' }, { key: 'apiKey' }] } },
    );

    expect(edited.errors).toBeUndefined();

    const value = await readConnectionForService(
      a.models,
      'tenant',
      createConnectionReadToken({
        subdomain: 'tenant',
        service: 'ai',
        lookup: { type: 'ai:provider', connectionId: id },
      }),
    );

    expect(value.fields).toEqual({
      baseUrl: 'https://x.example.com',
      apiKey: SECRET,
    });

    // The same name is free in another tenant; the record is invisible there.
    expect((await addProvider(b.models)).errors).toBeUndefined();
    await expect(b.models.Connections.getConnection(id)).rejects.toThrow(
      'Connection not found',
    );

    const removed = await run(
      a.models,
      'mutation connectionsRemove($_id: String!) { connectionsRemove(_id: $_id) }',
      { _id: id },
    );

    expect(removed.data?.connectionsRemove).toBe(id);
    expect(await a.models.Connections.countDocuments()).toBe(0);
  });
});
