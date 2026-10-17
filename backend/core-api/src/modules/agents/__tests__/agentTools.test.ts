import {
  callAgentTool,
  listAgentToolManifests,
  type IAgentToolDescriptor,
} from '@/agents/agentTools';

jest.mock('erxes-api-shared/utils', () => ({
  agentToolsAuthHeaderName: 'x-erxes-agent-auth',
  encodeAgentToolsAuthHeader: jest.fn(
    (subdomain: string, userId?: string) => `sig:${subdomain}:${userId ?? ''}`,
  ),
  getPluginAddress: jest.fn(),
  getPlugins: jest.fn(),
}));

import {
  agentToolsAuthHeaderName,
  encodeAgentToolsAuthHeader,
  getPluginAddress,
  getPlugins,
} from 'erxes-api-shared/utils';

const mockedGetPlugins = getPlugins as jest.MockedFunction<typeof getPlugins>;
const mockedGetPluginAddress = getPluginAddress as jest.MockedFunction<
  typeof getPluginAddress
>;
const mockedEncode = encodeAgentToolsAuthHeader as jest.MockedFunction<
  typeof encodeAgentToolsAuthHeader
>;

const okEnvelope = <T>(data: T): Response =>
  new Response(JSON.stringify({ status: 'success', data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const errorEnvelope = (
  code: string,
  message: string,
  status: number,
  suggestion?: string,
): Response =>
  new Response(
    JSON.stringify({
      status: 'error',
      error: { code, message, ...(suggestion ? { suggestion } : {}) },
    }),
    { status, headers: { 'content-type': 'application/json' } },
  );

const baseTool = (overrides: Partial<IAgentToolDescriptor> = {}): IAgentToolDescriptor => ({
  id: 'sales.trpc.deal.count',
  kind: 'trpc',
  plugin: 'sales',
  module: 'sales',
  method: 'query',
  destructive: false,
  description: 'Count deals',
  inputFields: null,
  permission: { module: 'sales', action: 'showDeals' },
  path: 'trpc.deal.count',
  ...overrides,
});

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch');
  mockedGetPlugins.mockReset();
  mockedGetPluginAddress.mockReset();
  mockedEncode.mockReset();
  mockedEncode.mockImplementation(
    (subdomain: string, userId?: string) => `sig:${subdomain}:${userId ?? ''}`,
  );
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe('listAgentToolManifests', () => {
  it('merges manifests from every registered plugin', async () => {
    mockedGetPlugins.mockResolvedValue(['sales', 'contacts']);
    mockedGetPluginAddress.mockImplementation(async (plugin) =>
      plugin === 'sales' ? 'http://sales:3305' : 'http://contacts:3307',
    );
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith('http://sales')) {
        return okEnvelope({ plugin: 'sales', tools: [baseTool()] });
      }
      return okEnvelope({
        plugin: 'contacts',
        tools: [
          baseTool({
            id: 'contacts.trpc.contact.find',
            plugin: 'contacts',
            module: 'contacts',
            description: 'Find contacts',
            path: 'trpc.contact.find',
            permission: { module: 'contacts', action: 'showContacts' },
          }),
        ],
      });
    });

    const result = await listAgentToolManifests('tenant');

    expect(result.manifests).toHaveLength(2);
    expect(result.failures).toEqual([]);
    expect(result.manifests.map((m) => m.plugin).sort()).toEqual([
      'contacts',
      'sales',
    ]);
  });

  it('reports dead services as failures without breaking discovery', async () => {
    mockedGetPlugins.mockResolvedValue(['healthy', 'no-addr', 'crashed']);
    mockedGetPluginAddress.mockImplementation(async (plugin) =>
      plugin === 'healthy' ? 'http://healthy:3300' : null,
    );
    fetchSpy.mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith('http://healthy')) {
        return okEnvelope({ plugin: 'healthy', tools: [baseTool()] });
      }
      return Promise.reject(new Error('ECONNREFUSED'));
    });

    const result = await listAgentToolManifests('tenant');

    expect(result.manifests).toHaveLength(1);
    expect(result.manifests[0].plugin).toBe('healthy');
    expect(result.failures).toHaveLength(2);
    const failedPlugins = result.failures.map((f) => f.plugin).sort();
    expect(failedPlugins).toEqual(['crashed', 'no-addr']);
    expect(
      result.failures.find((f) => f.plugin === 'no-addr')?.error,
    ).toMatch(/address/);
  });

  it('authenticates manifest fetches with a header signed for the tenant', async () => {
    mockedGetPlugins.mockResolvedValue(['sales']);
    mockedGetPluginAddress.mockResolvedValue('http://sales:3305');
    fetchSpy.mockResolvedValue(okEnvelope({ plugin: 'sales', tools: [] }));

    await listAgentToolManifests('tenant-auth');

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://sales:3305/agent-tools/manifest',
      expect.objectContaining({
        headers: expect.objectContaining({
          [agentToolsAuthHeaderName]: 'sig:tenant-auth:',
        }),
      }),
    );
    expect(mockedEncode).toHaveBeenCalledWith('tenant-auth');
  });
});

describe('callAgentTool', () => {
  it('executes a tool on its owning service with an identity signed for the acting user', async () => {
    mockedGetPluginAddress.mockResolvedValue('http://sales:3305');
    fetchSpy.mockResolvedValue(okEnvelope(42));

    const result = await callAgentTool({
      subdomain: 'tenant',
      userId: 'user-1',
      toolId: 'sales.trpc.deal.count',
      input: { query: { stage: 'open' } },
    });

    expect(result).toBe(42);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://sales:3305/agent-tools/call',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-erxes-agent-auth': 'sig:tenant:user-1',
        }),
        body: JSON.stringify({
          toolId: 'sales.trpc.deal.count',
          input: { query: { stage: 'open' } },
        }),
      }),
    );
    expect(mockedEncode).toHaveBeenCalledWith('tenant', 'user-1');
  });

  it('sends an empty input object when the model passes none', async () => {
    mockedGetPluginAddress.mockResolvedValue('http://sales:3305');
    fetchSpy.mockResolvedValue(okEnvelope(0));

    await callAgentTool({
      subdomain: 'tenant',
      userId: 'user-1',
      toolId: 'sales.trpc.deal.count',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ toolId: 'sales.trpc.deal.count', input: {} }),
      }),
    );
  });

  it('maps error envelopes to errors carrying code, HTTP status, and suggestion', async () => {
    mockedGetPluginAddress.mockResolvedValue('http://sales:3305');
    fetchSpy.mockResolvedValue(
      errorEnvelope('PERMISSION_DENIED', 'no access', 403, 'ask an admin'),
    );

    await expect(
      callAgentTool({
        subdomain: 'tenant',
        userId: 'user-1',
        toolId: 'sales.trpc.deal.count',
      }),
    ).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
      statusCode: 403,
      suggestion: 'ask an admin',
      message: 'no access',
    });
  });

  it('rejects an empty tool id before any network call', async () => {
    await expect(
      callAgentTool({
        subdomain: 'tenant',
        userId: 'user-1',
        toolId: '',
      }),
    ).rejects.toThrow(/Invalid agent tool id/);

    expect(mockedGetPluginAddress).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fails clearly when the owning service address is unavailable', async () => {
    mockedGetPluginAddress.mockResolvedValue(null);

    await expect(
      callAgentTool({
        subdomain: 'tenant',
        userId: 'user-1',
        toolId: 'sales.trpc.deal.count',
      }),
    ).rejects.toThrow(/address is not available/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
