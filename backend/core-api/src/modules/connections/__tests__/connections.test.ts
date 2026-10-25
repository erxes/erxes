/**
 * Connections — outcome tests against real infrastructure.
 *
 * Real: MongoDB through `generateModels` (SaaS mode: one database per tenant,
 * all of them throwaway), the GraphQL schema and shared resolver wrapper,
 * core's permission groups and `checkPermission`, `logHandler`, service
 * discovery, and HTTP tRPC between core and the simulated plugin services
 * `ai` and `sales`. In memory: Redis and the log queue, because the
 * developer's own may be live.
 */
import './testEnv';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createTRPCUntypedClient } from '@trpc/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import {
  checkPermissionGroup,
  CUSTOM_CONNECTION_TYPE,
  CUSTOM_CONNECTION_TYPE_ID,
  createConnectionReadToken,
  createConnectionTestToken,
  defineConnectionType,
  describeConnectionType,
  getConnection,
  IConnectionsMeta,
  IConnectionValue,
  initConnections,
  publishConnectionsMeta,
  resolveConnection,
} from 'erxes-api-shared/core-modules';
import { registerConnections } from 'erxes-api-shared/core-modules/connections/registry';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { createInternalHTTPBatchLink } from 'erxes-api-shared/utils/trpc/httpBatchLink';
import {
  clearServiceDiscoveryCache,
  createTRPCContext,
  encodeTRPCContextHeader,
  joinErxesGateway,
  startBeforeResolvers,
  trpcContextHeaderName,
  wrapApolloResolvers,
} from 'erxes-api-shared/utils';
import { graphql } from 'graphql';
import * as http from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import { generateModels, IModels } from '~/connectionResolvers';
import { permissions } from '~/meta/permissions';
import { IConnection, IConnectionField } from '@/connections/@types/connection';
import {
  connectionCustomResolvers,
  connectionMutations,
  connectionQueries,
} from '@/connections/graphql/resolvers';
import { mutations, queries, types } from '@/connections/graphql/schema';
import { getConnectionTypes } from '@/connections/registry';
import { readConnection } from '@/connections/service';
import {
  isSealedConnectionValue,
  openConnectionValue,
  sealConnectionValue,
} from '@/connections/sealing';
import { connectionsTrpcRouter } from '@/connections/trpc/connections';
import { buildConnectionFields } from '@/connections/validation';
import { TEST_DB_PREFIX } from './testEnv';

jest.mock('erxes-api-shared/utils/redis', () => ({
  redis: jest.requireActual('./testInfra').memoryRedis,
  resetConfigsCache: async () => undefined,
}));

jest.mock('erxes-api-shared/utils/mq-worker', () => ({
  ...jest.requireActual('erxes-api-shared/utils/mq-worker'),
  sendWorkerQueue: jest.requireActual('./testInfra').memoryQueue,
}));

jest.mock('erxes-api-shared/utils/graphqlPubSub', () => ({
  graphqlPubsub: { publish: async () => undefined },
}));

// SaaS service calls go through the public gateway hostname. Here the same
// tRPC call goes to the local core this suite starts, by its registered
// address, with the real context header; nothing else changes mode.
jest.mock('erxes-api-shared/utils/trpc', () => {
  const actual = jest.requireActual('erxes-api-shared/utils/trpc');
  const { createTRPCUntypedClient } = jest.requireActual('@trpc/client');
  const { createInternalHTTPBatchLink } = jest.requireActual(
    'erxes-api-shared/utils/trpc/httpBatchLink',
  );
  const { getPlugin } = jest.requireActual(
    'erxes-api-shared/utils/service-discovery',
  );

  return {
    ...actual,
    sendTRPCMessage: async ({
      subdomain,
      pluginName,
      method = 'query',
      module,
      action,
      input,
    }: {
      subdomain: string;
      pluginName: string;
      method?: 'query' | 'mutation';
      module: string;
      action: string;
      input: unknown;
    }) => {
      const { address } = await getPlugin(pluginName);
      const client = createTRPCUntypedClient({
        links: [
          createInternalHTTPBatchLink({
            url: `${address}/trpc`,
            headers: () => ({
              [actual.trpcContextHeaderName]: actual.encodeTRPCContextHeader(
                subdomain,
                method,
                {},
              ),
            }),
          }),
        ],
      });

      return client[method](`${module}.${action}`, input);
    },
  };
});

const { memoryRedis, queuedJobs } = jest.requireActual(
  './testInfra',
) as typeof import('./testInfra');

const SECRET = 'sk-live-0123456789-secret';
const TENANT_A = 'tenanta';
const TENANT_B = 'tenantb';

// What the `ai` service's test received and what `sales`' before-resolver
// hook received: observable effects inside those services.
const aiTestReceived: IConnectionValue[] = [];
const hookReceived: { resolver?: string; args?: unknown }[] = [];

const aiProvider = defineConnectionType({
  id: 'provider',
  label: 'AI provider',
  icon: 'IconSparkles',
  fields: [
    { key: 'baseUrl', label: 'Base URL', required: true, inputType: 'url' },
    { key: 'apiKey', label: 'API key', required: true, secret: true },
  ],
  test: async (connection) => {
    aiTestReceived.push(connection);

    if (connection.fields.apiKey === 'explode') {
      throw new Error(`upstream said no to ${connection.fields.apiKey}`);
    }

    return connection.fields.apiKey === SECRET
      ? { ok: true, message: 'Models listed' }
      : { ok: false, message: 'The provider rejected the API key' };
  },
  resolve: (connection) => ({
    baseURL: connection.fields.baseUrl,
    apiKey: connection.fields.apiKey,
  }),
});

const serviceMeta: Record<'ai' | 'sales', { connections: IConnectionsMeta }> = {
  ai: {
    connections: { types: [aiProvider], uses: [CUSTOM_CONNECTION_TYPE_ID] },
  },
  sales: { connections: { types: [], uses: [CUSTOM_CONNECTION_TYPE_ID] } },
};

const servers: http.Server[] = [];
const organizationIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
let coreAddress = '';
let typesSeenWhenAiJoined: string[] = [];
let admin: IUserDocument;
let member: IUserDocument;

const listen = async (app: express.Express) => {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  servers.push(server);

  return (server.address() as AddressInfo).port;
};

/** A plugin service starting the way `startPlugin` does. */
const startService = async (name: 'ai' | 'sales') => {
  const app = express();
  const port = await listen(app);
  const meta = serviceMeta[name];

  await joinErxesGateway({
    name,
    port,
    meta: publishConnectionsMeta(name, meta),
  });

  if (name === 'ai') {
    // Core may look the service up between its join and the rest of startup.
    typesSeenWhenAiJoined = (await getConnectionTypes(TENANT_A)).map(
      (type) => type.id,
    );
  }

  await initConnections(app, name, meta.connections);

  if (name === 'sales') {
    await startBeforeResolvers(app, name, {
      resolvers: {
        connections: ['connections', 'connectionsAdd', 'connectionsEdit'],
      },
      handler: async (_subdomain, data) => {
        hookReceived.push(data);
        return { status: 'ok' };
      },
    });
  }
};

/** Which service this process is: the shared helpers sign as it. */
const actAs = (name: 'ai' | 'sales') =>
  registerConnections(name, serviceMeta[name].connections);

const modelsOf = (subdomain: string): Promise<IModels> =>
  generateModels(subdomain);

const loadUser = async (models: IModels, _id: string) => {
  const user = await models.Users.findOne({ _id });

  if (!user) {
    throw new Error(`Seeded user ${_id} is missing`);
  }

  return user;
};

beforeAll(async () => {
  const seed = await mongoose
    .createConnection(process.env.CORE_MONGO_URL || '')
    .asPromise();

  await seed.collection('organizations').insertMany([
    {
      _id: organizationIds[0],
      subdomain: TENANT_A,
      charge: { ai: { free: 1 }, sales: { free: 1 } },
    },
    {
      _id: organizationIds[1],
      subdomain: TENANT_B,
      charge: { sales: { free: 1 } },
    },
  ]);
  await seed.close();

  const modelsA = await modelsOf(TENANT_A);
  const modelsB = await modelsOf(TENANT_B);

  // A running service has its indexes; wait for the unique name index.
  await modelsA.Connections.init();
  await modelsB.Connections.init();

  await modelsA.Users.collection.insertMany([
    {
      _id: 'admin-user',
      email: 'admin@example.com',
      isActive: true,
      permissionGroupIds: ['core:admin'],
    },
    {
      _id: 'member-user',
      email: 'member@example.com',
      isActive: true,
      permissionGroupIds: ['core:user'],
    },
  ] as Parameters<typeof modelsA.Users.collection.insertMany>[0]);
  admin = await loadUser(modelsA, 'admin-user');
  member = await loadUser(modelsA, 'member-user');

  const core = express();

  core.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  core.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: connectionsTrpcRouter,
      createContext: createTRPCContext(async (subdomain, context) => {
        context.models = await generateModels(subdomain, context);
        return context;
      }),
    }),
  );
  coreAddress = `http://localhost:${await listen(core)}`;

  await memoryRedis.set('erxes-service-core', coreAddress);
  await memoryRedis.set(
    'erxesservice:config:core',
    JSON.stringify({ meta: { permissions } }),
  );
  await memoryRedis.set('erxes-service-logs', coreAddress);
  await memoryRedis.set(
    'erxes-active-plugins',
    JSON.stringify(['core', 'ai', 'sales']),
  );

  await startService('ai');
  await startService('sales');
  clearServiceDiscoveryCache();
}, 60_000);

afterAll(async () => {
  for (const name of ['main', 'core', ...organizationIds.map(String)]) {
    await mongoose.connection
      .useDb(`${TEST_DB_PREFIX}_${name}`)
      .dropDatabase();
  }

  // The shared mongoose connection exits the process on disconnect, so it is
  // left to jest's forced exit.
  servers.forEach((server) => server.close());
});

beforeEach(() => {
  queuedJobs.length = 0;
  hookReceived.length = 0;
  aiTestReceived.length = 0;
});

const schema = makeExecutableSchema({
  typeDefs: `
    scalar Date
    type User { _id: String }
    ${types}
    type Query { ${queries} }
    type Mutation { ${mutations} }
  `,
  resolvers: wrapApolloResolvers({
    Query: connectionQueries,
    Mutation: connectionMutations,
    Connection: connectionCustomResolvers,
  }),
});

const gql = async (
  subdomain: string,
  source: string,
  variableValues?: Record<string, unknown>,
  user: IUserDocument = admin,
) =>
  graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      models: await modelsOf(subdomain),
      subdomain,
      user,
      checkPermission: checkPermissionGroup(subdomain, user),
      req: { headers: {} },
    },
  });

const VIEW = `_id name icon logo type typeLabel status hasTest lastTestStatus
  lastTestMessage fields { key label secret value hasValue }`;

const ADD = `mutation connectionsAdd($input: ConnectionAddInput!) {
  connectionsAdd(input: $input) { ${VIEW} } }`;
const EDIT = `mutation connectionsEdit($_id: String!, $input: ConnectionEditInput!) {
  connectionsEdit(_id: $_id, input: $input) { ${VIEW} } }`;
const LIST = `query connections { connections { ${VIEW} } }`;
const DETAIL = `query connectionsDetail($_id: String!) {
  connectionsDetail(_id: $_id) { ${VIEW} } }`;
const REMOVE = `mutation connectionsRemove($_id: String!) {
  connectionsRemove(_id: $_id) }`;
const TEST = `mutation connectionsTest($_id: String!) {
  connectionsTest(_id: $_id) { ok message connection { ${VIEW} } } }`;
const TYPES = `query connectionsTypes { connectionsTypes { id label hasTest } }`;

let nameSeq = 0;

const addProvider = async (
  subdomain = TENANT_A,
  overrides: Record<string, unknown> = {},
): Promise<{ _id: string; name: string }> => {
  const result = await gql(subdomain, ADD, {
    input: {
      name: `OpenAI ${++nameSeq}`,
      icon: 'IconSparkles',
      type: 'ai:provider',
      fields: [
        { key: 'baseUrl', value: 'https://api.example.com/v1' },
        { key: 'apiKey', value: SECRET },
      ],
      ...overrides,
    },
  });

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data?.connectionsAdd;
};

const addCustom = async (
  subdomain: string,
  name: string,
  fields: Record<string, unknown>[] = [],
): Promise<string> => {
  const result = await gql(subdomain, ADD, {
    input: { name, icon: 'IconPlug', type: CUSTOM_CONNECTION_TYPE_ID, fields },
  });

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data?.connectionsAdd._id;
};

// The document as stored, without the model.
const stored = async (subdomain: string, _id: string) =>
  (await modelsOf(subdomain)).Connections.findOne({ _id }).lean<
    IConnection & { _id: string }
  >();

const readAs = (
  service: 'ai' | 'sales',
  args: Parameters<typeof getConnection>[0],
) => {
  actAs(service);
  return getConnection(args);
};

const audits = () =>
  queuedJobs
    .filter(
      (job) => job.queue === 'put_log' && job.data.action === 'connectionRead',
    )
    .map(({ data }) => {
      const payload = data.payload as Record<string, string>;

      return {
        source: data.source,
        status: data.status,
        service: payload.service,
        type: payload.type,
        name: payload.name,
      };
    });

describe('sealing', () => {
  it('binds an envelope to its connection and key', () => {
    const sealed = sealConnectionValue('c1', 'apiKey', SECRET);

    expect(isSealedConnectionValue(sealed)).toBe(true);
    expect(sealed).not.toContain(SECRET);
    expect(openConnectionValue('c1', 'apiKey', sealed)).toBe(SECRET);
    expect(openConnectionValue('c2', 'apiKey', sealed)).toBeNull();
    expect(openConnectionValue('c1', 'token', sealed)).toBeNull();
  });

  it('never opens stored plaintext as a secret', () => {
    expect(openConnectionValue('c1', 'apiKey', SECRET)).toBeNull();
  });

  it('uses a key of its own, not the agents BYOK key', async () => {
    const { openSecret, sealSecret } = await import('@/agents/secretBox');

    expect(openSecret(sealConnectionValue('c1', 'apiKey', SECRET))).toBeNull();
    expect(openConnectionValue('c1', 'apiKey', sealSecret(SECRET))).toBeNull();
  });
});

describe('custom type fields', () => {
  const custom = describeConnectionType('core', CUSTOM_CONNECTION_TYPE);
  const build = (
    inputs: Parameters<typeof buildConnectionFields>[0]['inputs'],
    existing?: IConnectionField[],
  ) =>
    buildConnectionFields({
      descriptor: custom,
      connectionId: 'c1',
      inputs,
      existing,
    });

  it('seals the keys marked secret and keeps plain keys readable', () => {
    const [host, password] = build([
      { key: 'host', value: 'smtp.example.com' },
      { key: 'password', secret: true, value: SECRET },
    ]);

    expect(host.value).toBe('smtp.example.com');
    expect(password.value).not.toContain(SECRET);
    expect(openConnectionValue('c1', 'password', password.value)).toBe(SECRET);
  });

  it('keeps an omitted secret, replaces a given one and drops removed keys', () => {
    const existing = build([
      { key: 'password', secret: true, value: SECRET },
      { key: 'token', secret: true, value: 'old-token' },
      { key: 'gone', value: 'x' },
    ]);
    const next = build(
      [
        { key: 'password', secret: true },
        { key: 'token', secret: true, value: 'new-token' },
      ],
      existing,
    );

    expect(next.map((field) => field.key)).toEqual(['password', 'token']);
    expect(openConnectionValue('c1', 'password', next[0].value)).toBe(SECRET);
    expect(openConnectionValue('c1', 'token', next[1].value)).toBe('new-token');
  });

  it('never turns a saved secret into readable text without a new value', () => {
    const existing = build([{ key: 'password', secret: true, value: SECRET }]);

    expect(() => build([{ key: 'password', secret: false }], existing)).toThrow(
      'Enter a new value for password',
    );
  });

  it('rejects malformed and repeated keys', () => {
    expect(() => build([{ key: '1bad', value: 'x' }])).toThrow(
      /Keys start with a letter/,
    );
    expect(() =>
      build([
        { key: 'a', value: 'x' },
        { key: 'a', value: 'y' },
      ]),
    ).toThrow(/used twice/);
  });
});

describe('type registry', () => {
  it('lists a plugin type as soon as the plugin joins', () => {
    expect(typesSeenWhenAiJoined).toContain('ai:provider');
  });

  it('lists types only for tenants the owning service is available to', async () => {
    const ids = async (subdomain: string) =>
      (await gql(subdomain, TYPES)).data?.connectionsTypes.map(
        (type: { id: string }) => type.id,
      );

    expect(await ids(TENANT_A)).toEqual([
      CUSTOM_CONNECTION_TYPE_ID,
      'ai:provider',
    ]);
    expect(await ids(TENANT_B)).toEqual([CUSTOM_CONNECTION_TYPE_ID]);
  });

  it('ignores types a service publishes in another service’s namespace', async () => {
    const original = (await memoryRedis.get('erxesservice:config:sales')) || '';
    const config = JSON.parse(original);
    const forged = {
      icon: 'IconPlug',
      fields: [],
      allowCustomFields: true,
      hasTest: false,
      hasResolve: false,
    };

    config.meta.connections.types = [
      { ...forged, id: 'ai:provider', pluginName: 'sales', label: 'Impostor' },
      { ...forged, id: 'ai:shadow', pluginName: 'sales', label: 'Shadow' },
    ];
    await memoryRedis.set('erxesservice:config:sales', JSON.stringify(config));
    clearServiceDiscoveryCache();

    try {
      expect((await gql(TENANT_A, TYPES)).data?.connectionsTypes).toEqual([
        { id: CUSTOM_CONNECTION_TYPE_ID, label: 'Custom', hasTest: false },
        { id: 'ai:provider', label: 'AI provider', hasTest: true },
      ]);
    } finally {
      await memoryRedis.set('erxesservice:config:sales', original);
      clearServiceDiscoveryCache();
    }
  });
});

describe('GraphQL', () => {
  it('never returns a secret value in any response and keeps it sealed at rest', async () => {
    const added = await gql(TENANT_A, ADD, {
      input: {
        name: 'Secrets check',
        icon: 'IconSparkles',
        type: 'ai:provider',
        fields: [
          { key: 'baseUrl', value: 'https://api.example.com/v1' },
          { key: 'apiKey', value: SECRET },
        ],
      },
    });
    const _id = added.data?.connectionsAdd._id;
    const responses = [
      added,
      await gql(TENANT_A, LIST),
      await gql(TENANT_A, DETAIL, { _id }),
      await gql(TENANT_A, EDIT, { _id, input: { name: 'Secrets check 2' } }),
      await gql(TENANT_A, TEST, { _id }),
    ];
    const doc = await stored(TENANT_A, _id);
    const sealed = doc?.fields.find((field) => field.key === 'apiKey')?.value;

    expect(responses.map((response) => response.errors)).toEqual(
      responses.map(() => undefined),
    );
    expect(added.data?.connectionsAdd.fields).toContainEqual({
      key: 'apiKey',
      label: 'API key',
      secret: true,
      value: null,
      hasValue: true,
    });
    expect(sealed).toMatch(/^enc:v1:/);
    expect(JSON.stringify(doc)).not.toContain(SECRET);

    for (const response of responses) {
      expect(JSON.stringify(response)).not.toContain(SECRET);
      expect(JSON.stringify(response)).not.toContain(sealed);
    }
  });

  it('keeps secret inputs out of mutation logs and plugin hooks', async () => {
    await addProvider();
    await gql(TENANT_A, LIST);

    const mutationLog = queuedJobs.find(
      (job) =>
        job.queue === 'put_log' &&
        (job.data.payload as { mutationName?: string })?.mutationName ===
          'connectionsAdd',
    );

    expect(mutationLog?.data.payload).toMatchObject({ argsRedacted: true });
    expect(mutationLog?.data.payload).not.toHaveProperty('args');
    expect(JSON.stringify(queuedJobs)).not.toContain(SECRET);
    // The hook is live (it saw the list query) and never saw the add.
    expect(hookReceived.map((entry) => entry.resolver)).toEqual(['connections']);
    expect(JSON.stringify(hookReceived)).not.toContain(SECRET);
  });

  it('requires a name and an icon or logo, and an available type', async () => {
    const attempt = (subdomain: string, input: Record<string, unknown>) =>
      gql(subdomain, ADD, {
        input: { type: CUSTOM_CONNECTION_TYPE_ID, ...input },
      });

    expect(
      (await attempt(TENANT_A, { name: 'No icon' })).errors?.[0].message,
    ).toBe('Choose an icon or upload a logo');
    expect(
      (await attempt(TENANT_A, { name: '   ', icon: 'IconPlug' })).errors?.[0]
        .message,
    ).toBe('Enter a name');
    expect(
      (
        await attempt(TENANT_B, {
          name: 'Not here',
          icon: 'IconPlug',
          type: 'ai:provider',
        })
      ).errors?.[0].message,
    ).toBe('Choose an available connection type');
    expect(
      (await attempt(TENANT_A, { name: 'Logo only', logo: 'logo.png' })).errors,
    ).toBeUndefined();
  });

  it('keeps names unique per tenant, ignoring case', async () => {
    await addCustom(TENANT_A, 'Shared name');

    const duplicate = await gql(TENANT_A, ADD, {
      input: {
        name: 'SHARED NAME',
        icon: 'IconPlug',
        type: CUSTOM_CONNECTION_TYPE_ID,
      },
    });

    expect(duplicate.errors?.[0].message).toBe(
      'A connection with this name already exists',
    );
    await expect(addCustom(TENANT_B, 'Shared name')).resolves.toEqual(
      expect.any(String),
    );
  });

  it('keeps an omitted secret on edit and replaces a given one', async () => {
    const { _id, name } = await addProvider();
    const edit = (apiKey: Record<string, string>) =>
      gql(TENANT_A, EDIT, {
        _id,
        input: {
          fields: [
            { key: 'baseUrl', value: 'https://v2.example.com' },
            { key: 'apiKey', ...apiKey },
          ],
        },
      });
    const read = () =>
      readAs('ai', { subdomain: TENANT_A, type: 'ai:provider', name });

    await edit({});
    const kept = await read();
    await edit({ value: 'sk-rotated' });
    const replaced = await read();

    expect(kept.fields).toEqual({
      baseUrl: 'https://v2.example.com',
      apiKey: SECRET,
    });
    expect(replaced.fields.apiKey).toBe('sk-rotated');
  });

  it('refuses every read and change to a user without connection permissions', async () => {
    const { _id, name } = await addProvider();
    const asMember = (source: string, variables?: Record<string, unknown>) =>
      gql(TENANT_A, source, variables, member);

    const results = [
      await asMember(TYPES),
      await asMember(LIST),
      await asMember(DETAIL, { _id }),
      await asMember(ADD, {
        input: {
          name: 'By member',
          icon: 'IconPlug',
          type: CUSTOM_CONNECTION_TYPE_ID,
        },
      }),
      await asMember(EDIT, { _id, input: { name: 'Renamed by member' } }),
      await asMember(REMOVE, { _id }),
      await asMember(TEST, { _id }),
    ];

    expect(results.map((result) => result.errors?.[0].message)).toEqual(
      results.map(() => 'Permission required'),
    );

    const after = await stored(TENANT_A, _id);

    expect(after?.name).toBe(name);
    expect(after?.lastTestedAt).toBeUndefined();
    expect(aiTestReceived).toEqual([]);
    expect(
      await (await modelsOf(TENANT_A)).Connections.countDocuments({
        name: 'By member',
      }),
    ).toBe(0);
  });

  it('cannot reach another tenant’s connection', async () => {
    const { _id, name } = await addProvider(TENANT_A);

    const list = await gql(TENANT_B, LIST);
    const attempts = [
      await gql(TENANT_B, DETAIL, { _id }),
      await gql(TENANT_B, EDIT, { _id, input: { name: 'Taken over' } }),
      await gql(TENANT_B, REMOVE, { _id }),
      await gql(TENANT_B, TEST, { _id }),
    ];

    expect(
      list.data?.connections.map((connection: { _id: string }) => connection._id),
    ).not.toContain(_id);
    expect(attempts.map((attempt) => attempt.errors?.[0].message)).toEqual(
      attempts.map(() => 'Connection not found'),
    );
    expect((await stored(TENANT_A, _id))?.name).toBe(name);
  });
});

describe('plugin server access', () => {
  it('reads its own type, decrypted, by name or id', async () => {
    const { _id, name } = await addProvider();

    const byName = await readAs('ai', {
      subdomain: TENANT_A,
      type: 'ai:provider',
      name: name.toUpperCase(),
    });
    const byId = await readAs('ai', {
      subdomain: TENANT_A,
      type: 'ai:provider',
      connectionId: _id,
    });

    expect(byName).toEqual({
      _id,
      name,
      type: 'ai:provider',
      fields: { baseUrl: 'https://api.example.com/v1', apiKey: SECRET },
    });
    expect(byId).toEqual(byName);
  });

  it('reads a type it declared in uses', async () => {
    const _id = await addCustom(TENANT_A, 'Webhook signing', [
      { key: 'secret', secret: true, value: SECRET },
      { key: 'url', value: 'https://hooks.example.com' },
    ]);

    const value = await readAs('ai', {
      subdomain: TENANT_A,
      type: CUSTOM_CONNECTION_TYPE_ID,
      connectionId: _id,
    });

    expect(value.fields).toEqual({
      secret: SECRET,
      url: 'https://hooks.example.com',
    });
  });

  it('cannot read a type it did not declare', async () => {
    const { _id, name } = await addProvider();

    await expect(
      readAs('sales', { subdomain: TENANT_A, type: 'ai:provider', name }),
    ).rejects.toThrow('This service has not declared this connection type');
    await expect(
      readAs('sales', { subdomain: TENANT_A, type: 'ai:provider', connectionId: _id }),
    ).rejects.toThrow('This service has not declared this connection type');
  });

  it('cannot read a connection through a type it does not have', async () => {
    const { _id } = await addProvider();

    await expect(
      readAs('ai', {
        subdomain: TENANT_A,
        type: CUSTOM_CONNECTION_TYPE_ID,
        connectionId: _id,
      }),
    ).rejects.toThrow('Connection not found');
  });

  it('cannot read in a tenant the service is not available to', async () => {
    const { name } = await addProvider(TENANT_A, { name: 'Tenant A only' });

    await expect(
      readAs('ai', { subdomain: TENANT_B, type: 'ai:provider', name }),
    ).rejects.toThrow('This service has not declared this connection type');
  });

  it('cannot reach another tenant’s connection', async () => {
    const _id = await addCustom(TENANT_A, 'Custom in A', [
      { key: 'k', value: 'v' },
    ]);

    // `sales` may read custom connections in both tenants, just not across.
    await expect(
      readAs('sales', {
        subdomain: TENANT_A,
        type: CUSTOM_CONNECTION_TYPE_ID,
        connectionId: _id,
      }),
    ).resolves.toMatchObject({ fields: { k: 'v' } });
    await expect(
      readAs('sales', {
        subdomain: TENANT_B,
        type: CUSTOM_CONNECTION_TYPE_ID,
        connectionId: _id,
      }),
    ).rejects.toThrow('Connection not found');
  });

  it('rejects calls without a valid signature or bound to another tenant', async () => {
    const { name } = await addProvider();
    const call = (subdomain: string, token: string) =>
      createTRPCUntypedClient({
        links: [
          createInternalHTTPBatchLink({
            url: `${coreAddress}/trpc`,
            headers: () => ({
              [trpcContextHeaderName]: encodeTRPCContextHeader(
                subdomain,
                'mutation',
                {},
              ),
            }),
          }),
        ],
      }).mutation('connections.read', { token });
    const token = createConnectionReadToken({
      subdomain: TENANT_A,
      service: 'ai',
      lookup: { type: 'ai:provider', name },
    });
    const [payload] = token.split('.');

    await expect(call(TENANT_A, `${payload}.forged`)).rejects.toThrow(
      'Invalid request',
    );
    await expect(call(TENANT_A, 'not-a-token')).rejects.toThrow(
      'Invalid request',
    );
    await expect(call(TENANT_B, token)).rejects.toThrow('Invalid request');
    await expect(call(TENANT_A, token)).resolves.toMatchObject({ name });
  });

  it('audits every read, allowed or denied, without values', async () => {
    const { name } = await addProvider();

    await readAs('ai', { subdomain: TENANT_A, type: 'ai:provider', name });
    await expect(
      readAs('sales', { subdomain: TENANT_A, type: 'ai:provider', name }),
    ).rejects.toThrow();

    expect(audits()).toEqual([
      { source: 'auth', status: 'success', service: 'ai', type: 'ai:provider', name },
      { source: 'auth', status: 'failed', service: 'sales', type: 'ai:provider', name },
    ]);
    expect(JSON.stringify(queuedJobs)).not.toContain(SECRET);
  });

  it('lets core’s own server code read with an audit entry', async () => {
    const { _id, name } = await addProvider();

    const value = await readConnection(await modelsOf(TENANT_A), TENANT_A, {
      type: 'ai:provider',
      connectionId: _id,
    });

    expect(value.fields.apiKey).toBe(SECRET);
    expect(audits()).toEqual([
      { source: 'auth', status: 'success', service: 'core', type: 'ai:provider', name: undefined },
    ]);
    expect(name).toBe(value.name);
  });

  it('builds the type’s client through its resolver', async () => {
    const { name } = await addProvider();

    actAs('ai');

    await expect(
      resolveConnection({ subdomain: TENANT_A, type: 'ai:provider', name }),
    ).resolves.toEqual({
      baseURL: 'https://api.example.com/v1',
      apiKey: SECRET,
    });
  });
});

describe('testing a connection', () => {
  it('runs the owning service’s test on the saved values and records the outcome', async () => {
    const good = await addProvider();
    const bad = await addProvider(TENANT_A, {
      fields: [
        { key: 'baseUrl', value: 'https://api.example.com/v1' },
        { key: 'apiKey', value: 'sk-wrong' },
      ],
    });

    const passed = await gql(TENANT_A, TEST, { _id: good._id });
    const failed = await gql(TENANT_A, TEST, { _id: bad._id });

    expect(passed.data?.connectionsTest).toMatchObject({
      ok: true,
      message: 'Models listed',
      connection: { status: 'verified', lastTestStatus: 'success' },
    });
    expect(failed.data?.connectionsTest).toMatchObject({
      ok: false,
      message: 'The provider rejected the API key',
      connection: { status: 'failed', lastTestStatus: 'failed' },
    });
    expect(aiTestReceived.map((value) => value.fields.apiKey)).toEqual([
      SECRET,
      'sk-wrong',
    ]);
  });

  it('never shows the text of an error thrown by the test', async () => {
    const { _id } = await addProvider(TENANT_A, {
      fields: [
        { key: 'baseUrl', value: 'https://api.example.com/v1' },
        { key: 'apiKey', value: 'explode' },
      ],
    });

    const result = await gql(TENANT_A, TEST, { _id });

    expect(result.data?.connectionsTest).toMatchObject({
      ok: false,
      message: 'The connection test failed.',
    });
    expect(JSON.stringify(result)).not.toContain('explode');
  });

  it('refuses types without a test', async () => {
    const _id = await addCustom(TENANT_A, 'Untestable');

    const result = await gql(TENANT_A, TEST, { _id });

    expect(result.errors?.[0].message).toBe(
      'This connection type cannot be tested',
    );
  });

  it('the plugin runs no test for a request core did not sign', async () => {
    const aiAddress = await memoryRedis.get('erxes-service-ai');
    const send = (token: string) =>
      createTRPCUntypedClient({
        links: [
          createInternalHTTPBatchLink({
            url: `${aiAddress}/connections`,
            headers: () => ({
              [trpcContextHeaderName]: encodeTRPCContextHeader(
                TENANT_A,
                'mutation',
                {},
              ),
            }),
          }),
        ],
      }).mutation('test', { subdomain: TENANT_A, data: { token } });
    const connection = {
      _id: 'x',
      name: 'x',
      type: 'ai:provider',
      fields: { baseUrl: 'https://evil.example.com', apiKey: SECRET },
    };
    const [payload] = createConnectionTestToken(TENANT_A, connection).split('.');

    await expect(send(`${payload}.forged`)).rejects.toThrow('Invalid request');
    await expect(
      send(createConnectionTestToken(TENANT_B, connection)),
    ).rejects.toThrow('Invalid request');
    expect(aiTestReceived).toEqual([]);
    await expect(
      send(createConnectionTestToken(TENANT_A, connection)),
    ).resolves.toMatchObject({ ok: true });
  });
});
