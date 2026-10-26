import {
  buildGraphqlTools,
  listGraphqlCapabilities,
} from '@/agents/graphqlTools';
import { decodeAgentToolsAuthHeader } from 'erxes-api-shared/utils/agent-tools/auth';

// Only service discovery is mocked; the auth header codec and the response
// size guard keep their real implementations so the signed header round-trip
// and the response cap are exercised for real.
jest.mock('erxes-api-shared/utils', () => {
  const auth = jest.requireActual<
    typeof import('erxes-api-shared/utils/agent-tools/auth')
  >('erxes-api-shared/utils/agent-tools/auth');
  const responseLimit = jest.requireActual<
    typeof import('erxes-api-shared/utils/agent-tools/responseLimit')
  >('erxes-api-shared/utils/agent-tools/responseLimit');

  return {
    ...auth,
    ...responseLimit,
    getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
      process.env[name] || defaultValue || '',
    getPluginAddress: jest.fn(),
    getPlugins: jest.fn(),
  };
});

// See tools.test.ts — the bridge contract under test is the user-provided
// execute/requireApproval, so createTool passes the definition through.
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition) => definition,
}));

import { getPluginAddress, getPlugins } from 'erxes-api-shared/utils';

const mockedGetPlugins = getPlugins as jest.MockedFunction<typeof getPlugins>;
const mockedGetPluginAddress = getPluginAddress as jest.MockedFunction<
  typeof getPluginAddress
>;

const TEST_SECRET = 'test-graphql-tools-secret';
const TEST_GATEWAY = 'http://gateway.test';

type TBridge = Awaited<ReturnType<typeof buildGraphqlTools>>;
type TSearchInput = Parameters<
  NonNullable<TBridge['searchGraphql']['execute']>
>[0];
type TCallInput = Parameters<NonNullable<TBridge['callGraphql']['execute']>>[0];

const buildContext = (values: Record<string, unknown>) => ({
  requestContext: { get: (key: string) => values[key] },
});

const runSearch = async (
  input: TSearchInput,
  contextValues: Record<string, unknown>,
): Promise<{ matched: number; fields: Record<string, unknown>[] }> => {
  if (!searchGraphql.execute) {
    throw new Error('searchGraphql.execute missing');
  }

  return (await searchGraphql.execute(
    input,
    buildContext(contextValues) as never,
  )) as { matched: number; fields: Record<string, unknown>[] };
};

const runCall = async (
  input: TCallInput,
  contextValues: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  if (!callGraphql.execute) {
    throw new Error('callGraphql.execute missing');
  }

  return (await callGraphql.execute(
    input,
    buildContext(contextValues) as never,
  )) as Record<string, unknown>;
};

const sdlResponse = (sdl: string): Response =>
  new Response(JSON.stringify({ data: { _service: { sdl } } }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const graphqlResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const CONTACTS_SDL = `
  type Query {
    "List customers"
    customers(page: Int, filter: CustomerFilter): [Customer]
    login(email: String!): String
  }
  type Mutation {
    customersRemove(id: String!): String
    customersAdd(name: String!): Customer
  }
  input CustomerFilter { searchValue: String, tag: TagKind }
  enum TagKind { VIP REGULAR }
  type Customer @key(fields: "_id") { _id: String! name: String }
`;

const DEALS_SDL = `
  extend type Query { deals(searchValue: String): [Deal] }
  type Deal @key(fields: "_id") { _id: String! amount: Float }
`;

let searchGraphql: TBridge['searchGraphql'];
let callGraphql: TBridge['callGraphql'];
let fetchSpy: jest.SpyInstance;

beforeAll(async () => {
  const bridge = await buildGraphqlTools();
  searchGraphql = bridge.searchGraphql;
  callGraphql = bridge.callGraphql;
});

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = TEST_SECRET;
  process.env.GATEWAY_URL = TEST_GATEWAY;
  fetchSpy = jest.spyOn(global, 'fetch');
  mockedGetPlugins.mockReset();
  mockedGetPluginAddress.mockReset();
});

afterEach(() => {
  fetchSpy.mockRestore();
  delete process.env.JWT_TOKEN_SECRET;
  delete process.env.GATEWAY_URL;
});

const stubSchemaSources = (options?: { fail?: string[] }) => {
  mockedGetPlugins.mockResolvedValue(['contacts', 'sales']);
  mockedGetPluginAddress.mockImplementation(async (plugin) =>
    plugin === 'contacts' ? 'http://contacts:3307' : 'http://sales:3305',
  );
  fetchSpy.mockImplementation(async (input) => {
    const url = String(input);

    if (options?.fail?.some((name) => url.includes(name))) {
      return Promise.reject(new Error('ECONNREFUSED'));
    }

    if (url.startsWith('http://contacts')) {
      return sdlResponse(CONTACTS_SDL);
    }

    return sdlResponse(DEALS_SDL);
  });
};

describe('listGraphqlCapabilities', () => {
  it('preserves each root operation owner, including schema extensions', async () => {
    stubSchemaSources();
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_699_999_900_000);
    try {
      const catalog = await listGraphqlCapabilities();
      expect(catalog).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'customers',
            plugin: 'contacts',
            method: 'query',
          }),
          expect.objectContaining({
            path: 'customersAdd',
            plugin: 'contacts',
            method: 'mutation',
          }),
          expect.objectContaining({
            path: 'deals',
            plugin: 'sales',
            method: 'query',
          }),
        ]),
      );
      expect(catalog.some((entry) => entry.path === 'login')).toBe(false);
    } finally {
      dateSpy.mockRestore();
    }
  });
});

describe('searchGraphql', () => {
  const context = {
    subdomain: 'tenant',
    userId: 'user-1',
    approvalMode: 'destructive',
  };

  it('introspects each service SDL and ranks root fields by intent', async () => {
    stubSchemaSources();
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    try {
      const result = await runSearch({ intent: 'customers list' }, context);

      expect(result.matched).toBeGreaterThanOrEqual(1);
      const customers = result.fields.find((f) => f.field === 'customers');

      expect(customers).toBeDefined();
      expect(customers?.operation).toBe('query');
      expect(customers?.signature).toBe(
        'customers(page: Int, filter: CustomerFilter): [Customer]',
      );
      expect(customers?.description).toBe('List customers');
      expect(customers?.requiresApproval).toBe(false);
      expect(String(customers?.types)).toContain('input CustomerFilter');
      expect(String(customers?.types)).toContain('enum TagKind');
      expect(String(customers?.types)).toContain('type Customer');
    } finally {
      dateSpy.mockRestore();
    }
  });

  it('merges "extend type Query" SDL and survives a failing service', async () => {
    stubSchemaSources({ fail: ['contacts'] });
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_100_000);

    try {
      const result = await runSearch({ intent: 'deals' }, context);

      const deals = result.fields.find((f) => f.field === 'deals');
      expect(deals).toBeDefined();
      expect(deals?.signature).toBe('deals(searchValue: String): [Deal]');
    } finally {
      dateSpy.mockRestore();
    }
  });

  it('excludes authentication fields from the catalog', async () => {
    stubSchemaSources();
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_200_000);

    try {
      const result = await runSearch({ intent: 'login' }, context);

      expect(result.fields.map((f) => f.field)).not.toContain('login');
    } finally {
      dateSpy.mockRestore();
    }
  });

  it('flags mutations for approval in writes mode, high-risk only in destructive mode', async () => {
    stubSchemaSources();
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_300_000);

    try {
      const writesResult = await runSearch(
        { intent: 'customersAdd' },
        { ...context, approvalMode: 'writes' },
      );
      const addField = writesResult.fields.find(
        (f) => f.field === 'customersAdd',
      );
      expect(addField?.requiresApproval).toBe(true);

      const destructiveResult = await runSearch(
        { intent: 'customers' },
        { ...context, approvalMode: 'destructive' },
      );
      const find = (name: string) =>
        destructiveResult.fields.find((f) => f.field === name);

      expect(find('customersRemove')?.requiresApproval).toBe(true);
      expect(find('customersAdd')?.requiresApproval).toBe(false);
      expect(find('customers')?.requiresApproval).toBe(false);
    } finally {
      dateSpy.mockRestore();
    }
  });
});

describe('callGraphql', () => {
  const context = {
    subdomain: 'tenant',
    userId: 'user-1',
    threadId: 'thread-7',
  };

  it('posts the operation to the gateway with a signed identity header', async () => {
    fetchSpy.mockResolvedValue(graphqlResponse({ data: { customers: [] } }));

    const result = await runCall(
      {
        query: 'query Customers { customers { _id } }',
        variables: { page: 1 },
      } as TCallInput,
      context,
    );

    expect(result).toEqual({ status: 'ok', data: { customers: [] } });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${TEST_GATEWAY}/graphql`);
    expect(init.method).toBe('POST');

    const headers = init.headers as Record<string, string>;
    expect(headers['nginx-hostname']).toBe('tenant');
    expect(headers['Content-Type']).toBe('application/json');

    const auth = decodeAgentToolsAuthHeader({
      'x-erxes-agent-auth': headers['x-erxes-agent-auth'],
    });
    expect(auth).toEqual({
      subdomain: 'tenant',
      userId: 'user-1',
      threadId: 'thread-7',
    });

    expect(JSON.parse(String(init.body))).toEqual({
      query: 'query Customers { customers { _id } }',
      variables: { page: 1 },
    });
  });

  it.each([
    {
      gateway: '',
      domain: '',
      api: '',
      expected: 'http://localhost:4000/graphql',
    },
    {
      gateway: '',
      domain: '',
      api: 'http://localhost:4010/',
      expected: 'http://localhost:4010/graphql',
    },
    {
      gateway: '',
      domain: 'https://tenant.example.test',
      api: '',
      expected: 'https://tenant.example.test/gateway/graphql',
    },
    {
      gateway: 'https://private-gateway.test/',
      domain: 'https://workspace.test',
      api: '',
      expected: 'https://private-gateway.test/graphql',
    },
  ])(
    'resolves an absolute gateway address: $expected',
    async ({ gateway, domain, api, expected }) => {
      const previous = {
        DOMAIN: process.env.DOMAIN,
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      };
      process.env.GATEWAY_URL = gateway;
      process.env.DOMAIN = domain;
      process.env.REACT_APP_API_URL = api;
      try {
        fetchSpy.mockResolvedValue(
          graphqlResponse({ data: { customers: [] } }),
        );
        const result = await runCall(
          { query: 'query Customers { customers { _id } }' } as TCallInput,
          context,
        );
        expect(result).toMatchObject({ status: 'ok' });
        expect(fetchSpy.mock.calls[0][0]).toBe(expected);
      } finally {
        for (const [key, value] of Object.entries(previous)) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
      }
    },
  );

  it('returns partial data together with sanitized errors', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse({
        data: { customers: [{ _id: 'c1' }] },
        errors: [
          {
            message: 'denied field',
            path: ['customers', 0, 'secret'],
            extensions: { code: 'FORBIDDEN', internal: 'x' },
          },
        ],
      }),
    );

    const result = await runCall(
      { query: '{ customers { _id } }' } as TCallInput,
      context,
    );

    expect(result).toEqual({
      status: 'ok',
      data: { customers: [{ _id: 'c1' }] },
      references: [expect.stringMatching(/^\[\[ref:[a-f0-9-]{36}\]\]$/)],
      referenceManifest: {
        version: 1,
        items: [
          expect.objectContaining({
            handle: expect.any(String),
            type: 'customer',
            id: 'c1',
            label: 'c1',
          }),
        ],
      },
      errors: [
        {
          message: 'denied field',
          path: ['customers', 0, 'secret'],
          code: 'FORBIDDEN',
        },
      ],
    });
  });

  it('reports errors-only responses with the first extensions.code', async () => {
    fetchSpy.mockResolvedValue(
      graphqlResponse(
        {
          data: null,
          errors: [
            { message: 'Cannot query field', extensions: { code: 'BAD' } },
            { message: 'also bad' },
          ],
        },
        400,
      ),
    );

    const result = await runCall({ query: '{ nope }' } as TCallInput, context);

    expect(result).toMatchObject({
      status: 'error',
      error: 'Cannot query field; also bad',
      code: 'BAD',
      httpStatus: 400,
    });
    expect((result.errors as unknown[]).length).toBe(2);
  });

  it('rejects oversized data with RESPONSE_TOO_LARGE', async () => {
    const big = 'x'.repeat(70 * 1024);
    fetchSpy.mockResolvedValue(graphqlResponse({ data: { dump: big } }));

    const result = await runCall({ query: '{ dump }' } as TCallInput, context);

    expect(result).toMatchObject({
      status: 'error',
      code: 'RESPONSE_TOO_LARGE',
    });
  });

  it('never calls fetch for a denied authentication field', async () => {
    const result = await runCall(
      { query: 'mutation { login(email: "a@b.c") }' } as TCallInput,
      context,
    );

    expect(result).toMatchObject({
      status: 'error',
      code: 'GRAPHQL_OPERATION_NOT_ALLOWED',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps credentials inside JSON config values out of tool output and memory', async () => {
    fetchSpy.mockResolvedValue(graphqlResponse({data: {configs: [{code: 'PROVIDER', value: {nested: [{apiKey: 'dummy-secret'}]}}]}}));
    const result = await runCall({query: 'query AgentsConfigs { configs { code value } }'}, context);
    expect(result).toMatchObject({status: 'error', code: 'GRAPHQL_OPERATION_NOT_ALLOWED'});
    expect(result).not.toHaveProperty('data');
    expect(JSON.stringify(result)).not.toContain('dummy-secret');
    expect(result).not.toHaveProperty('referenceManifest');
  });

  it('follows response aliases and fragments when checking JSON values', async () => {
    fetchSpy.mockResolvedValue(graphqlResponse({data: {items: [{settings: {password: 'dummy-secret'}}]}}));
    const result = await runCall({query: 'query AgentsConfigs { items: configs { ...AgentsValue } } fragment AgentsValue on Config { settings: value }'}, context);
    expect(result).toMatchObject({status: 'error', code: 'GRAPHQL_OPERATION_NOT_ALLOWED'});
    expect(JSON.stringify(result)).not.toContain('dummy-secret');
  });

  it('does not mistake aliases of safe selected fields for credential fields', async () => {
    fetchSpy.mockResolvedValue(graphqlResponse({data: {token: [{password: 'customer-1', secret: {name: 'Jane'}}]}}));
    const result = await runCall({query: 'query AgentsCustomers { token: customers { password: _id secret: details { name } } }'}, context);
    expect(result.status).toBe('ok');
  });

  it('returns a parse error result without calling fetch', async () => {
    const result = await runCall(
      { query: '{ customers {' } as TCallInput,
      context,
    );

    expect(result).toMatchObject({
      status: 'error',
      code: 'GRAPHQL_PARSE_ERROR',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('omits threadId from the signed header when none is stamped', async () => {
    fetchSpy.mockResolvedValue(graphqlResponse({ data: { ok: true } }));

    await runCall({ query: '{ customers }' } as TCallInput, {
      subdomain: 'tenant',
      userId: 'user-1',
    });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    const auth = decodeAgentToolsAuthHeader({
      'x-erxes-agent-auth': headers['x-erxes-agent-auth'],
    });

    expect(auth).toEqual({ subdomain: 'tenant', userId: 'user-1' });
    expect(auth).not.toHaveProperty('threadId');
  });
});

describe('GraphQL approval admission', () => {
  const needsApproval = async (query: string, approvalMode = 'writes') => {
    const predicate = callGraphql.requireApproval;
    if (typeof predicate !== 'function')
      throw new Error('Missing approval predicate');
    return predicate({ query }, { requestContext: { approvalMode } });
  };
  it('never suspends read queries, including schema introspection', async () => {
    expect(await needsApproval('query Read { customers { _id } }')).toBe(false);
    expect(
      await needsApproval('query Inspect { __type(name: "Deal") { name } }'),
    ).toBe(false);
  });
  it('returns denied or malformed inputs as tool errors without asking for permission', async () => {
    expect(
      await needsApproval(
        'mutation Denied { agentsConnectionRemove(provider: "openai") }',
      ),
    ).toBe(false);
    expect(await needsApproval('not graphql')).toBe(false);
    fetchSpy.mockRejectedValue(new Error('Must not fetch'));
    const output = await runCall(
      { query: 'query Denied { agentsConnections { provider } }' },
      { subdomain: 'tenant', userId: 'user' },
    );
    expect(output.status).toBe('error');
    expect(output.code).toBe('GRAPHQL_OPERATION_NOT_ALLOWED');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('still gates valid mutations according to the run approval mode', async () => {
    expect(
      await needsApproval('mutation Add { customersAdd(name: "A") { _id } }'),
    ).toBe(true);
    expect(
      await needsApproval(
        'mutation Add { customersAdd(name: "A") { _id } }',
        'destructive',
      ),
    ).toBe(false);
    expect(
      await needsApproval(
        'mutation Delete { customersRemove(id: "1") }',
        'destructive',
      ),
    ).toBe(true);
  });

  it.each([
    { query: 'query AgentsPortal { getClientPortals { list { safe: token } } }' },
    {
      query: 'mutation AgentsPortal($config: ClientPortalConfigInput) { clientPortalUpdate(clientPortal: $config) { _id } }',
      variables: { config: { firebaseConfig: { serviceAccountKey: 'dummy' } } },
    },
  ])('rejects nested credentials before approval or gateway execution', async (input) => {
    const predicate = callGraphql.requireApproval;
    if (typeof predicate !== 'function') throw new Error('Missing approval predicate');
    expect(await predicate(input, { requestContext: { approvalMode: 'writes' } })).toBe(false);
    const result = await runCall(input, { subdomain: 'tenant', userId: 'user' });
    expect(result).toMatchObject({ status: 'error', code: 'GRAPHQL_OPERATION_NOT_ALLOWED' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain('dummy');
  });
});

it('forwards aliased introspection to the gateway as the acting user without producing record references', async () => {
  const query =
    'query AgentsSalesTypeFields { deal: __type(name: "Deal") { fields { name } } currency: __type(name: "DealTotalCurrency") { fields { name } } }';
  fetchSpy.mockResolvedValue(
    graphqlResponse({
      data: {
        deal: { fields: [{ name: '_id' }] },
        currency: { fields: [{ name: 'currency' }] },
      },
    }),
  );
  const output = await runCall(
    { query },
    { subdomain: 'tenant', userId: 'user-1' },
  );
  expect(output.status).toBe('ok');
  expect(output.data).toEqual({
    deal: { fields: [{ name: '_id' }] },
    currency: { fields: [{ name: 'currency' }] },
  });
  expect(output.referenceManifest).toBeUndefined();
  const [url, init] = fetchSpy.mock.calls[0];
  expect(url).toBe(`${TEST_GATEWAY}/graphql`);
  expect(JSON.parse(init.body).query).toBe(query);
  expect(decodeAgentToolsAuthHeader(init.headers)).toEqual({
    subdomain: 'tenant',
    userId: 'user-1',
  });
});
