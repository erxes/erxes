import {
  buildGraphqlTools,
  listAgentPluginSkills,
  listGraphqlCapabilities,
} from '@/agents/graphqlTools';

// The shared core-modules barrel loads Mongoose models built from the mocked
// utils; the agents module only needs the agent contract from it.
jest.mock('erxes-api-shared/core-modules', () =>
  jest.requireActual('erxes-api-shared/core-modules/agent'),
);
jest.mock('erxes-api-shared/utils', () => {
  const auth = jest.requireActual('erxes-api-shared/utils/agent-tools/auth');
  const responseLimit = jest.requireActual(
    'erxes-api-shared/utils/agent-tools/responseLimit',
  );

  return {
    ...auth,
    ...responseLimit,
    getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
      process.env[name] || defaultValue || '',
    getPluginAddress: jest.fn(),
    getPlugins: jest.fn(),
    keyForConfig: (name: string) => `erxesservice:config:${name}`,
    redis: { get: jest.fn() },
  };
});
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition) => definition,
}));

import { getPluginAddress, getPlugins, redis } from 'erxes-api-shared/utils';

const mockedGetPlugins = getPlugins as jest.MockedFunction<typeof getPlugins>;
const mockedGetPluginAddress = getPluginAddress as jest.MockedFunction<
  typeof getPluginAddress
>;
const mockedRedisGet = redis.get as unknown as jest.Mock;

const CORE_SDL = `
  type Query { customers(searchValue: String): [Customer] }
  type Customer @key(fields: "_id") { _id: String! name: String }
`;

const SALES_SDL = `
  extend type Query {
    "List deals"
    deals(pipelineId: String): [Deal]
    "Client portal deals"
    cpDeals(pipelineId: String): [Deal]
  }
  extend type Mutation {
    cpDealsAdd(name: String): Deal
  }
  type Deal @key(fields: "_id") { _id: String! name: String }
`;

const salesSkill = {
  name: 'pipeline-analysis',
  description: 'Analyse deals by pipeline and stage.',
  instructions: 'Count deals per stage.',
  operations: ['deals', 'cpDeals'],
};

const registrations: Record<string, unknown> = {};
const unreachable = new Set<string>();
let clock = 1_800_000_000_000;
let dateSpy: jest.SpyInstance;
let fetchSpy: jest.SpyInstance;

/** Moves past the catalog TTL so the next read refreshes. */
const expireCatalog = () => {
  clock += 61_000;
};

const register = (plugin: string, agent: unknown) => {
  registrations[plugin] = { meta: { agent } };
};

const sdlResponse = (sdl: string): Response =>
  new Response(JSON.stringify({ data: { _service: { sdl } } }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const sdlFetches = () =>
  fetchSpy.mock.calls.filter(([url]) => String(url).endsWith(':1/graphql'))
    .length;

beforeAll(() => {
  dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => clock);
});

afterAll(() => {
  dateSpy.mockRestore();
});

beforeEach(() => {
  expireCatalog();
  unreachable.clear();
  register('core', undefined);
  register('sales', {
    skills: [salesSkill],
    hiddenOperations: { queries: ['cpDeals'], mutations: ['cpDealsAdd'] },
  });
  process.env.JWT_TOKEN_SECRET = 'test-plugin-skills-secret';
  process.env.GATEWAY_URL = 'http://gateway.test';
  mockedGetPlugins.mockResolvedValue(['core', 'sales']);
  mockedGetPluginAddress.mockImplementation(
    async (plugin) => `http://${plugin}:1`,
  );
  mockedRedisGet.mockImplementation(async (key: string) => {
    const registration = registrations[key.replace('erxesservice:config:', '')];

    return registration ? JSON.stringify(registration) : null;
  });
  fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const plugin = url.replace(/^http:\/\/([^:]+):1\/graphql$/, '$1');

    if (unreachable.has(plugin)) {
      throw new Error('ECONNREFUSED');
    }

    if (url === 'http://core:1/graphql') {
      return sdlResponse(CORE_SDL);
    }

    if (url === 'http://sales:1/graphql') {
      return sdlResponse(SALES_SDL);
    }

    return new Response(
      JSON.stringify({ data: { cpDeals: [{ _id: 'd1', name: 'Deal' }] } }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  });
});

afterEach(() => {
  fetchSpy.mockRestore();
  delete process.env.JWT_TOKEN_SECRET;
  delete process.env.GATEWAY_URL;
});

const context = {
  requestContext: {
    get: (key: string) =>
      ({ subdomain: 'tenant', userId: 'user-1', approvalMode: 'writes' }[key]),
  },
};

describe('plugin-hidden operations', () => {
  it('leave discovery but stay executable', async () => {
    const { searchGraphql, callGraphql } = await buildGraphqlTools();

    const capabilities = await listGraphqlCapabilities();
    expect(capabilities.map(({ path }) => path).sort()).toEqual([
      'customers',
      'deals',
    ]);

    const search = (await searchGraphql.execute?.(
      { intent: 'deals client portal' },
      context as never,
    )) as { fields: { field: string }[] };
    expect(search.fields.map(({ field }) => field)).toEqual(['deals']);

    const call = (await callGraphql.execute?.(
      { query: 'query SalesCpDeals { cpDeals { _id name } }' },
      context as never,
    )) as { status: string; data: unknown };
    expect(call.status).toBe('ok');
    expect(call.data).toEqual({ cpDeals: [{ _id: 'd1', name: 'Deal' }] });
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://gateway.test/graphql',
      expect.objectContaining({
        body: expect.stringContaining('cpDeals'),
      }),
    );
  });

  it('cannot hide another plugin’s operations', async () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    register('sales', { hiddenOperations: { queries: ['customers'] } });

    try {
      const capabilities = await listGraphqlCapabilities();

      expect(capabilities.map(({ path }) => path)).toContain('customers');
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('cannot hide query "customers"'),
      );
    } finally {
      warn.mockRestore();
    }
  });
});

describe('listAgentPluginSkills', () => {
  it('waits for the first load of a fresh process', async () => {
    await jest.isolateModulesAsync(async () => {
      const fresh = await import('@/agents/graphqlTools');

      expect(
        (await fresh.listAgentPluginSkills()).map(({ name }) => name),
      ).toEqual(['sales-pipeline-analysis']);
    });
  });

  it('starts a run without plugin skills when the first load is slow', async () => {
    mockedGetPlugins.mockReturnValue(new Promise(() => undefined));

    await jest.isolateModulesAsync(async () => {
      jest.doMock('node:timers/promises', () => ({
        setTimeout: async (_ms: number, value: unknown) => value,
      }));
      const fresh = await import('@/agents/graphqlTools');

      expect(await fresh.listAgentPluginSkills()).toEqual([]);
    });
  });

  describe('with a loaded catalog', () => {
    beforeEach(async () => {
      await listGraphqlCapabilities();
    });

    it('collects namespaced skills from reachable plugins and caches them', async () => {
      const skills = await listAgentPluginSkills();

      expect(skills.map(({ name }) => name)).toEqual([
        'sales-pipeline-analysis',
      ]);
      expect(skills[0].instructions).toContain('`deals`');
      expect(skills[0].instructions).not.toContain('cpDeals');

      const fetches = sdlFetches();
      await listAgentPluginSkills();
      await listGraphqlCapabilities();
      expect(sdlFetches()).toBe(fetches);
    });

    it('drops a disabled plugin’s skills and hidden operations', async () => {
      await listAgentPluginSkills();
      expireCatalog();
      mockedGetPlugins.mockResolvedValue(['core']);

      // The expired catalog is served once while it refreshes.
      await listGraphqlCapabilities();
      expect(await listAgentPluginSkills()).toEqual([]);
    });

    it('drops an unreachable plugin’s skills', async () => {
      await listAgentPluginSkills();
      expireCatalog();
      unreachable.add('sales');

      await listGraphqlCapabilities();
      expect(await listAgentPluginSkills()).toEqual([]);
    });

    it('picks up a re-registered plugin after the cache expires', async () => {
      await listAgentPluginSkills();
      register('sales', {
        skills: [{ ...salesSkill, name: 'forecast', operations: undefined }],
      });

      expect((await listAgentPluginSkills()).map(({ name }) => name)).toEqual([
        'sales-pipeline-analysis',
      ]);

      expireCatalog();
      const stale = await listAgentPluginSkills();
      expect(stale.map(({ name }) => name)).toEqual([
        'sales-pipeline-analysis',
      ]);

      await listGraphqlCapabilities();
      expect((await listAgentPluginSkills()).map(({ name }) => name)).toEqual([
        'sales-forecast',
      ]);
    });

    it('keeps the schema when a registration cannot be read', async () => {
      mockedRedisGet.mockRejectedValue(new Error('ECONNREFUSED'));
      expireCatalog();

      await listGraphqlCapabilities();
      expect(await listAgentPluginSkills()).toEqual([]);
      expect(
        (await listGraphqlCapabilities()).map(({ path }) => path),
      ).toContain('cpDeals');
    });
  });
});
