import { RequestContext } from '@mastra/core/request-context';
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
// Service discovery is a fake backed by `registrations` and `reachable`; the
// auth header codec and response limit keep their real implementations.
jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/agent-tools/auth'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools/responseLimit'),
  getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
    process.env[name] || defaultValue || '',
  getPluginAddress: async (plugin: string) => `http://${plugin}:1`,
  getPlugins: jest.fn(),
  keyForConfig: (name: string) => `erxesservice:config:${name}`,
  redis: { get: jest.fn() },
}));
// The tools' own execute functions run; only Mastra's wrapper is skipped.
jest.mock('@mastra/core/tools', () => ({
  createTool: <T>(definition: T): T => definition,
}));

import { getPlugins, redis } from 'erxes-api-shared/utils';

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

const SDL: Record<string, string> = { core: CORE_SDL, sales: SALES_SDL };

const salesSkill = {
  name: 'pipeline-analysis',
  description: 'Analyse deals by pipeline and stage.',
  instructions: 'Count records per stage.',
  operations: ['deals', 'cpDeals'],
};

const registrations = new Map<string, unknown>();
const reachable = new Set<string>();
let clock = 1_800_000_000_000;
let dateSpy: jest.SpyInstance;
let fetchSpy: jest.SpyInstance;

/** Moves past the catalog TTL so the next read refreshes. */
const expireCatalog = () => {
  clock += 61_000;
};

const register = (plugin: string, agent: unknown) => {
  registrations.set(plugin, { meta: { agent } });
};

const json = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

/** A gateway that answers only the operation it was actually sent. */
const gatewayAnswer = (body: string): Response => {
  const { query } = JSON.parse(body) as { query: string };

  return /\bcpDeals\b/.test(query)
    ? json({ data: { cpDeals: [{ _id: 'd1', name: 'Portal deal' }] } })
    : json({ errors: [{ message: 'Unexpected operation' }] });
};

const toolContext = () => ({
  requestContext: new RequestContext([
    ['subdomain', 'tenant'],
    ['userId', 'user-1'],
    ['approvalMode', 'writes'],
  ]),
});

beforeAll(() => {
  dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => clock);
});

afterAll(() => {
  dateSpy.mockRestore();
});

beforeEach(() => {
  expireCatalog();
  registrations.clear();
  reachable.clear();
  reachable.add('core').add('sales');
  register('sales', {
    skills: [salesSkill],
    hiddenOperations: { queries: ['cpDeals'], mutations: ['cpDealsAdd'] },
  });
  process.env.JWT_TOKEN_SECRET = 'test-plugin-skills-secret';
  process.env.GATEWAY_URL = 'http://gateway.test';
  jest.mocked(getPlugins).mockResolvedValue(['core', 'sales']);
  jest.mocked(redis.get).mockImplementation(async (key: string) => {
    const registration = registrations.get(
      key.replace('erxesservice:config:', ''),
    );

    return registration ? JSON.stringify(registration) : null;
  });
  fetchSpy = jest
    .spyOn(global, 'fetch')
    .mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === 'http://gateway.test/graphql') {
        return gatewayAnswer(String(init?.body));
      }

      const plugin = url.replace(/^http:\/\/([^:]+):1\/graphql$/, '$1');

      if (!reachable.has(plugin) || !SDL[plugin]) {
        throw new Error('ECONNREFUSED');
      }

      return json({ data: { _service: { sdl: SDL[plugin] } } });
    });
});

afterEach(() => {
  fetchSpy.mockRestore();
  delete process.env.JWT_TOKEN_SECRET;
  delete process.env.GATEWAY_URL;
});

describe('plugin-hidden operations', () => {
  it('are absent from discovery yet still executable', async () => {
    const { searchGraphql, callGraphql } = await buildGraphqlTools();

    const capabilities = await listGraphqlCapabilities();
    expect(capabilities.map(({ path }) => path).sort()).toEqual([
      'customers',
      'deals',
    ]);

    const search = await searchGraphql.execute?.(
      { intent: 'deals client portal' },
      toolContext(),
    );
    expect(search).toMatchObject({ fields: [{ field: 'deals' }] });

    const call = await callGraphql.execute?.(
      { query: 'query SalesCpDeals { cpDeals { _id name } }' },
      toolContext(),
    );
    expect(call).toMatchObject({
      status: 'ok',
      data: { cpDeals: [{ _id: 'd1', name: 'Portal deal' }] },
    });
  });

  it('can only be declared by the plugin that owns them', async () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    register('sales', { hiddenOperations: { queries: ['customers'] } });

    try {
      const capabilities = await listGraphqlCapabilities();

      expect(capabilities.map(({ path }) => path)).toContain('customers');
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
    jest.mocked(getPlugins).mockReturnValue(new Promise(() => undefined));

    await jest.isolateModulesAsync(async () => {
      jest.doMock('node:timers/promises', () => ({
        setTimeout: async (_ms: number, value: unknown) => value,
      }));
      const fresh = await import('@/agents/graphqlTools');

      expect(await fresh.listAgentPluginSkills()).toEqual([]);
    });
  }, 2_000);

  describe('with a loaded catalog', () => {
    beforeEach(async () => {
      await listGraphqlCapabilities();
    });

    it('points skill hints only at discoverable operations', async () => {
      const [skill] = await listAgentPluginSkills();

      expect(skill.instructions).toContain('deals');
      expect(skill.instructions).not.toContain('cpDeals');
    });

    it('reuses the catalog within the TTL', async () => {
      reachable.delete('sales');

      const capabilities = await listGraphqlCapabilities();

      expect(capabilities.map(({ path }) => path)).toContain('deals');
      expect((await listAgentPluginSkills()).map(({ name }) => name)).toEqual([
        'sales-pipeline-analysis',
      ]);
    });

    it('serves the expired skills once while it refreshes, then the new ones', async () => {
      register('sales', {
        skills: [{ ...salesSkill, name: 'forecast', operations: undefined }],
      });
      expireCatalog();

      expect((await listAgentPluginSkills()).map(({ name }) => name)).toEqual([
        'sales-pipeline-analysis',
      ]);

      await listGraphqlCapabilities();
      expect((await listAgentPluginSkills()).map(({ name }) => name)).toEqual([
        'sales-forecast',
      ]);
    });

    it('keeps the schema when a registration cannot be read', async () => {
      jest.mocked(redis.get).mockRejectedValue(new Error('ECONNREFUSED'));
      expireCatalog();

      const capabilities = await listGraphqlCapabilities();

      expect(await listAgentPluginSkills()).toEqual([]);
      expect(capabilities.map(({ path }) => path)).toContain('cpDeals');
    });
  });
});
