import {
  buildAgentsTools,
  isGatedAgentToolCall,
  requiresApproval,
} from '@/agents/tools';
import {
  callAgentTool,
  listAgentToolManifests,
  type IAgentToolDescriptor,
} from '@/agents/agentTools';

jest.mock('@/agents/agentTools', () => ({
  callAgentTool: jest.fn(),
  listAgentToolManifests: jest.fn(),
}));

// Mastra's `createTool` wraps the user-provided execute with validation and a
// runtime context builder. The bridge contract under test is the user-provided
// execute/requireApproval functions themselves; bypassing the wrapper keeps the
// test focused on the bridge behavior rather than Mastra's internal context
// plumbing.
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition) => definition,
}));

const mockedCallAgentTool = callAgentTool as jest.MockedFunction<
  typeof callAgentTool
>;
const mockedListAgentToolManifests = listAgentToolManifests as jest.MockedFunction<
  typeof listAgentToolManifests
>;

type TBridge = Awaited<ReturnType<typeof buildAgentsTools>>;
type TSearchInput = Parameters<NonNullable<TBridge['searchTools']['execute']>>[0];
type TSearchContext = Parameters<NonNullable<TBridge['searchTools']['execute']>>[1];
type TCallInput = Parameters<NonNullable<TBridge['callTool']['execute']>>[0];
type TCallContext = Parameters<NonNullable<TBridge['callTool']['execute']>>[1];

interface IContextOverrides {
  subdomain?: string;
  userId?: string;
}

const buildContext = (overrides: IContextOverrides = {}) => {
  const values: Record<string, unknown> = {};
  if (overrides.subdomain !== undefined) values.subdomain = overrides.subdomain;
  if (overrides.userId !== undefined) values.userId = overrides.userId;
  return {
    requestContext: { get: (key: string) => values[key] },
  };
};

const searchContext = (
  overrides: IContextOverrides = {},
): TSearchContext => buildContext(overrides) as unknown as TSearchContext;

const callContext = (
  overrides: IContextOverrides = {},
): TCallContext => buildContext(overrides) as unknown as TCallContext;

const runSearch = async (
  input: TSearchInput,
  ctx: TSearchContext,
): Promise<{ matched: number; tools: IAgentToolDescriptor[] }> => {
  if (!searchTools.execute) throw new Error('searchTools.execute missing');
  return (await searchTools.execute(input, ctx)) as {
    matched: number;
    tools: IAgentToolDescriptor[];
  };
};

const runCall = async (
  input: TCallInput,
  ctx: TCallContext,
): Promise<Record<string, unknown>> => {
  if (!callTool.execute) throw new Error('callTool.execute missing');
  return (await callTool.execute(input, ctx)) as Record<string, unknown>;
};

const baseDescriptor = (
  overrides: Partial<IAgentToolDescriptor> = {},
): IAgentToolDescriptor => ({
  id: 'sales.trpc.deal.count',
  kind: 'trpc',
  plugin: 'sales',
  module: 'sales',
  method: 'query',
  destructive: false,
  description: 'Count deals matching a query',
  inputFields: null,
  permission: { module: 'sales', action: 'showDeals' },
  path: 'trpc.deal.count',
  ...overrides,
});

const manifest = (tools: IAgentToolDescriptor[], plugin = 'sales') => ({
  manifests: [{ plugin, tools }],
  failures: [],
});

let searchTools: TBridge['searchTools'];
let callTool: TBridge['callTool'];

beforeAll(async () => {
  const bridge = await buildAgentsTools();
  searchTools = bridge.searchTools;
  callTool = bridge.callTool;
});

beforeEach(() => {
  mockedCallAgentTool.mockReset();
  mockedListAgentToolManifests.mockReset();
});

describe('searchTools', () => {
  it('returns only tools matching the intent, ranked by term overlap', async () => {
    mockedListAgentToolManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'sales',
          tools: [
            baseDescriptor({
              id: 'sales.trpc.deal.count',
              description: 'Count deals matching a query',
              path: 'trpc.deal.count',
            }),
            baseDescriptor({
              id: 'sales.trpc.deal.list',
              description: 'List deals with filters',
              path: 'trpc.deal.list',
            }),
          ],
        },
        {
          plugin: 'contacts',
          tools: [
            baseDescriptor({
              id: 'contacts.trpc.contact.find',
              plugin: 'contacts',
              module: 'contacts',
              description: 'Find contacts',
              path: 'trpc.contact.find',
              permission: { module: 'contacts', action: 'showContacts' },
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await runSearch(
      { intent: 'count deals' },
      searchContext({ subdomain: 'tenant-rank', userId: 'user-rank' }),
    );

    expect(result.matched).toBe(2);
    expect(result.tools.map((t) => t.id)).toEqual([
      'sales.trpc.deal.count',
      'sales.trpc.deal.list',
    ]);
  });

  it('overlays the reviewed product-create contract onto discovery results', async () => {
    mockedListAgentToolManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'core',
          tools: [
            baseDescriptor({
              id: 'core.trpc.products.createProduct',
              plugin: 'core',
              module: 'products',
              description: 'Create a product. Input: { doc: { name, code?, sku? } }',
              path: 'products.createProduct',
              method: 'mutation',
              permission: { module: 'products', action: 'productsCreate' },
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await runSearch(
      { intent: 'create product' },
      searchContext({ subdomain: 'tenant-overlay', userId: 'user-overlay' }),
    );

    expect(result.tools[0].description).toMatch(/Use code, not sku/);
    expect(result.tools[0].inputSchema).toMatchObject({
      required: ['doc'],
      additionalProperties: false,
    });
  });

  it('caps results at the requested maxResults', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([
        baseDescriptor({
          id: 'sales.trpc.deal.count',
          description: 'Count deals matching a query',
          path: 'trpc.deal.count',
        }),
        baseDescriptor({
          id: 'sales.trpc.deal.list',
          description: 'List deals with filters',
          path: 'trpc.deal.list',
        }),
      ]),
    );

    const result = await runSearch(
      { intent: 'count deals', maxResults: 1 },
      searchContext({ subdomain: 'tenant-cap', userId: 'user-cap' }),
    );

    expect(result.matched).toBe(2);
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].id).toBe('sales.trpc.deal.count');
  });

  it('returns an empty result, not an error, when nothing matches', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([
        baseDescriptor({
          id: 'sales.trpc.deal.list',
          description: 'List deals with filters',
          path: 'trpc.deal.list',
        }),
      ]),
    );

    const result = await runSearch(
      { intent: 'quantum accounting' },
      searchContext({ subdomain: 'tenant-empty', userId: 'user-empty' }),
    );

    expect(result).toEqual({ matched: 0, tools: [] });
  });

  it('merges tool descriptors from every plugin manifest', async () => {
    mockedListAgentToolManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'sales',
          tools: [
            baseDescriptor({
              id: 'sales.trpc.deal.find',
              description: 'Find deals by query',
              path: 'trpc.deal.find',
            }),
          ],
        },
        {
          plugin: 'contacts',
          tools: [
            baseDescriptor({
              id: 'contacts.trpc.contact.find',
              plugin: 'contacts',
              module: 'contacts',
              description: 'Find contacts by query',
              path: 'trpc.contact.find',
              permission: { module: 'contacts', action: 'showContacts' },
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await runSearch(
      { intent: 'find' },
      searchContext({ subdomain: 'tenant-merge', userId: 'user-merge' }),
    );

    expect(result.matched).toBe(2);
    expect(result.tools.map((t) => t.plugin).sort()).toEqual([
      'contacts',
      'sales',
    ]);
  });

  it('caches manifests per subdomain for 60 seconds', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([baseDescriptor()]),
    );

    await runSearch(
      { intent: 'x' },
      searchContext({ subdomain: 'tenant-cache', userId: 'user-cache' }),
    );
    await runSearch(
      { intent: 'y' },
      searchContext({ subdomain: 'tenant-cache', userId: 'user-cache' }),
    );
    expect(mockedListAgentToolManifests).toHaveBeenCalledTimes(1);
    expect(mockedListAgentToolManifests).toHaveBeenCalledWith('tenant-cache');

    await runSearch(
      { intent: 'z' },
      searchContext({ subdomain: 'tenant-other', userId: 'user-other' }),
    );
    expect(mockedListAgentToolManifests).toHaveBeenCalledTimes(2);
    expect(mockedListAgentToolManifests).toHaveBeenLastCalledWith(
      'tenant-other',
    );
  });

  it('re-fetches after the cache TTL expires', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([baseDescriptor()]),
    );

    const dateSpy = jest.spyOn(Date, 'now');
    try {
      dateSpy.mockReturnValue(1_000_000);
      await runSearch(
        { intent: 'x' },
        searchContext({ subdomain: 'tenant-ttl', userId: 'user-ttl' }),
      );
      expect(mockedListAgentToolManifests).toHaveBeenCalledTimes(1);

      dateSpy.mockReturnValue(1_061_001);
      await runSearch(
        { intent: 'y' },
        searchContext({ subdomain: 'tenant-ttl', userId: 'user-ttl' }),
      );
      expect(mockedListAgentToolManifests).toHaveBeenCalledTimes(2);
    } finally {
      dateSpy.mockRestore();
    }
  });
});

describe('callTool', () => {
  it('executes the tool as the acting user identified by the request context', async () => {
    mockedCallAgentTool.mockResolvedValue({ total: 7 });

    const result = await runCall(
      { toolId: 'sales.trpc.deal.count' } as TCallInput,
      callContext({ subdomain: 'tenant-x', userId: 'user-42' }),
    );

    expect(result).toEqual({ status: 'ok', result: { total: 7 } });
    expect(mockedCallAgentTool).toHaveBeenCalledWith({
      subdomain: 'tenant-x',
      userId: 'user-42',
      toolId: 'sales.trpc.deal.count',
      input: undefined,
    });
  });

  it('rejects execution when the request context is incomplete', async () => {
    await expect(
      runCall(
        { toolId: 'sales.trpc.deal.count' } as TCallInput,
        callContext({ subdomain: 'tenant-x' }),
      ),
    ).rejects.toThrow(/incomplete/);
    expect(mockedCallAgentTool).not.toHaveBeenCalled();
  });

  it('returns a 403 permission denial to the model as a readable result instead of throwing', async () => {
    const denied = Object.assign(new Error("You don't have permission to run this tool"), {
      code: 'PERMISSION_DENIED',
      statusCode: 403,
    });
    mockedCallAgentTool.mockRejectedValue(denied);

    const result = await runCall(
      { toolId: 'sales.trpc.deal.count' } as TCallInput,
      callContext({ subdomain: 'tenant-403', userId: 'user-403' }),
    );

    expect(result).toEqual({
      status: 'error',
      error: "You don't have permission to run this tool",
      code: 'PERMISSION_DENIED',
      httpStatus: 403,
    });
  });

  it('returns a 413 oversized response with its suggestion so the model can retry narrower', async () => {
    const tooLarge = Object.assign(new Error('Response too large'), {
      code: 'RESPONSE_TOO_LARGE',
      statusCode: 413,
      suggestion: 'Paginate the query',
    });
    mockedCallAgentTool.mockRejectedValue(tooLarge);

    const result = await runCall(
      { toolId: 'sales.trpc.deal.count' } as TCallInput,
      callContext({ subdomain: 'tenant-413', userId: 'user-413' }),
    );

    expect(result).toMatchObject({
      status: 'error',
      code: 'RESPONSE_TOO_LARGE',
      httpStatus: 413,
      suggestion: 'Paginate the query',
    });
  });

  it('validates reviewed product creates before calling the owning service', async () => {
    const result = await runCall(
      {
        toolId: 'core.trpc.products.createProduct',
        input: { name: 'Tea', sku: 'TEA-1' },
      } as TCallInput,
      callContext({ subdomain: 'tenant-contract', userId: 'user-contract' }),
    );

    expect(mockedCallAgentTool).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'error',
      code: 'INVALID_TOOL_INPUT',
      httpStatus: 400,
    });
    expect(String(result.error)).not.toContain('TEA-1');
  });

  it('forwards a valid reviewed product create to the owning service', async () => {
    mockedCallAgentTool.mockResolvedValue({ _id: 'p1' });
    const input = {
      doc: { name: 'Tea', code: 'TEA-1', categoryId: 'c1', uom: 'pc' },
    };

    const result = await runCall(
      { toolId: 'core.trpc.products.createProduct', input } as TCallInput,
      callContext({ subdomain: 'tenant-contract-ok', userId: 'user-contract-ok' }),
    );

    expect(result).toEqual({
      status: 'ok',
      result: { _id: 'p1' },
      references: ['[[product:p1:p1]]'],
    });
    expect(mockedCallAgentTool).toHaveBeenCalledWith({
      subdomain: 'tenant-contract-ok',
      userId: 'user-contract-ok',
      toolId: 'core.trpc.products.createProduct',
      input,
    });
  });

  it('returns unknown-tool failures as readable results without an httpStatus', async () => {
    mockedCallAgentTool.mockRejectedValue(new Error('Tool not found'));

    const result = await runCall(
      { toolId: 'sales.trpc.deal.count' } as TCallInput,
      callContext({ subdomain: 'tenant-404', userId: 'user-404' }),
    );

    expect(result).toEqual({
      status: 'error',
      error: 'Tool not found',
      code: 'SERVER_ERROR',
    });
    expect(result).not.toHaveProperty('httpStatus');
  });
});

describe('callTool approval gate (requireApproval)', () => {
  const runRequireApproval = async (
    input: { toolId: string; input?: Record<string, unknown> },
    requestContext: Record<string, unknown>,
  ): Promise<boolean> => {
    const gate = callTool.requireApproval;

    if (typeof gate !== 'function') {
      throw new Error('callTool.requireApproval must be a per-call function');
    }

    return await gate(input, { requestContext });
  };

  it('requires approval for a tool the manifest flags destructive', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([
        baseDescriptor({
          id: 'sales.trpc.deal.remove',
          description: 'Remove a deal',
          path: 'trpc.deal.remove',
          method: 'mutation',
          destructive: true,
        }),
      ]),
    );

    await expect(
      runRequireApproval(
        { toolId: 'sales.trpc.deal.remove' },
        { subdomain: 'tenant-gate-d', userId: 'user-gate-d' },
      ),
    ).resolves.toBe(true);
  });

  it('requires approval for an always-confirm tool even when the manifest does not flag it destructive', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest(
        [
          baseDescriptor({
            id: 'frontline.trpc.inbox.conversations.changeStatus',
            plugin: 'frontline',
            module: 'inbox',
            description: 'Change conversation status',
            path: 'inbox.conversations.changeStatus',
            method: 'query',
            destructive: false,
          }),
        ],
        'inbox',
      ),
    );

    await expect(
      runRequireApproval(
        { toolId: 'frontline.trpc.inbox.conversations.changeStatus' },
        { subdomain: 'tenant-gate-ac', userId: 'user-gate-ac' },
      ),
    ).resolves.toBe(true);
  });

  it('does not require approval for a read tool', async () => {
    mockedListAgentToolManifests.mockResolvedValue(manifest([baseDescriptor()]));

    await expect(
      runRequireApproval(
        { toolId: 'sales.trpc.deal.count' },
        { subdomain: 'tenant-gate-read', userId: 'user-gate-read' },
      ),
    ).resolves.toBe(false);
  });

  it('does not require approval for an unknown tool (execution surfaces the platform error)', async () => {
    mockedListAgentToolManifests.mockResolvedValue(manifest([baseDescriptor()]));

    await expect(
      runRequireApproval(
        { toolId: 'sales.trpc.does.not.exist' },
        { subdomain: 'tenant-gate-unknown', userId: 'user-gate-unknown' },
      ),
    ).resolves.toBe(false);
  });

  it('does not require approval (and does not fetch manifests) when the request context has no subdomain', async () => {
    await expect(
      runRequireApproval({ toolId: 'sales.trpc.deal.remove' }, {}),
    ).resolves.toBe(false);
    expect(mockedListAgentToolManifests).not.toHaveBeenCalled();
  });

  it('never gates searchTools', () => {
    expect(searchTools.requireApproval).toBeUndefined();
  });
});

describe('tool registration', () => {
  it('registers exactly two tools with stable ids and self-describing contracts', () => {
    expect(searchTools.id).toBe('searchTools');
    expect(callTool.id).toBe('callTool');
    expect(typeof searchTools.description).toBe('string');
    expect(searchTools.description.length).toBeGreaterThan(0);
    expect(typeof callTool.description).toBe('string');
    expect(callTool.description.length).toBeGreaterThan(0);
    expect(callTool.description.toLowerCase()).toContain('toolid');
    expect(searchTools.description.toLowerCase()).toContain('toolid');
    expect(searchTools.inputSchema).toBeDefined();
    expect(callTool.inputSchema).toBeDefined();
  });
});

describe('isGatedAgentToolCall', () => {
  it('gates a tool the manifest flags destructive', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([
        baseDescriptor({
          id: 'sales.trpc.deal.remove',
          description: 'Remove a deal',
          path: 'trpc.deal.remove',
          method: 'mutation',
          destructive: true,
        }),
      ]),
    );

    await expect(
      isGatedAgentToolCall('tenant-helper-d', 'sales.trpc.deal.remove'),
    ).resolves.toBe(true);
  });

  it('gates an always-confirm tool even when the manifest does not flag it destructive', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest(
        [
          baseDescriptor({
            id: 'frontline.trpc.inbox.conversations.changeStatus',
            plugin: 'frontline',
            module: 'inbox',
            description: 'Change conversation status',
            path: 'inbox.conversations.changeStatus',
            method: 'query',
            destructive: false,
          }),
        ],
        'inbox',
      ),
    );

    await expect(
      isGatedAgentToolCall('tenant-helper-ac', 'frontline.trpc.inbox.conversations.changeStatus'),
    ).resolves.toBe(true);
  });

  it('does not gate a read tool or an unknown tool id', async () => {
    mockedListAgentToolManifests.mockResolvedValue(manifest([baseDescriptor()]));

    await expect(
      isGatedAgentToolCall('tenant-helper-read', 'sales.trpc.deal.count'),
    ).resolves.toBe(false);
    await expect(
      isGatedAgentToolCall('tenant-helper-unknown', 'sales.trpc.does.not.exist'),
    ).resolves.toBe(false);
  });
});

describe('requiresApproval modes', () => {
  const mutationAdd = () =>
    baseDescriptor({
      id: 'core.trpc.customers.add',
      plugin: 'core',
      path: 'customers.add',
      method: 'mutation',
      destructive: false,
    });
  const mutationRemove = () =>
    baseDescriptor({
      id: 'core.trpc.customers.remove',
      plugin: 'core',
      path: 'customers.remove',
      method: 'mutation',
      destructive: false,
    });
  const mergeQuery = () =>
    baseDescriptor({
      id: 'sales.trpc.deals.merge',
      path: 'deals.merge',
      method: 'query',
      destructive: true,
    });
  const replyTool = () =>
    baseDescriptor({
      id: 'frontline.trpc.inbox.conversations.reply',
      plugin: 'frontline',
      path: 'inbox.conversations.reply',
      method: 'mutation',
      destructive: false,
    });
  const broadcastTool = () =>
    baseDescriptor({
      id: 'core.trpc.broadcast.send',
      plugin: 'core',
      path: 'broadcast.send',
      method: 'mutation',
      destructive: false,
    });
  const readTool = () =>
    baseDescriptor({
      id: 'sales.trpc.deal.find',
      path: 'deal.find',
      method: 'query',
      destructive: false,
    });
  const alwaysConfirmQuery = () =>
    baseDescriptor({
      id: 'frontline.trpc.inbox.conversations.changeStatus',
      plugin: 'frontline',
      path: 'inbox.conversations.changeStatus',
      method: 'query',
      destructive: false,
    });

  it("mode 'writes' gates every mutation; 'destructive' gates by high-risk name", () => {
    // Plain creates/updates: held under 'writes', free under 'destructive'.
    expect(requiresApproval(mutationAdd(), 'writes')).toBe(true);
    expect(requiresApproval(mutationAdd(), 'destructive')).toBe(false);

    // Deletes/merges/customer-facing sends ask in BOTH modes.
    expect(requiresApproval(mutationRemove(), 'writes')).toBe(true);
    expect(requiresApproval(mutationRemove(), 'destructive')).toBe(true);
    expect(requiresApproval(mergeQuery(), 'writes')).toBe(true);
    expect(requiresApproval(mergeQuery(), 'destructive')).toBe(true);
    expect(requiresApproval(replyTool(), 'writes')).toBe(true);
    expect(requiresApproval(replyTool(), 'destructive')).toBe(true);
    expect(requiresApproval(broadcastTool(), 'writes')).toBe(true);
    expect(requiresApproval(broadcastTool(), 'destructive')).toBe(true);

    // Plain reads ask in neither mode.
    expect(requiresApproval(readTool(), 'writes')).toBe(false);
    expect(requiresApproval(readTool(), 'destructive')).toBe(false);

    // Always-confirm ids ask in both modes regardless of shape.
    expect(requiresApproval(alwaysConfirmQuery(), 'writes')).toBe(true);
    expect(requiresApproval(alwaysConfirmQuery(), 'destructive')).toBe(true);
  });

  it('gates the agent write tools under writes only — none are high-risk names', () => {
    for (const [id, path] of [
      ['core.trpc.customers.add', 'customers.add'],
      ['core.trpc.customers.edit', 'customers.edit'],
      ['core.trpc.internalNotes.add', 'internalNotes.add'],
      ['sales.trpc.deal.add', 'deal.add'],
      ['sales.trpc.deal.edit', 'deal.edit'],
      ['sales.trpc.deal.move', 'deal.move'],
    ]) {
      const descriptor = baseDescriptor({ id, path, method: 'mutation' });

      expect(requiresApproval(descriptor, 'writes')).toBe(true);
      expect(requiresApproval(descriptor, 'destructive')).toBe(false);
    }
  });

  it('missing or unknown mode falls back to writes behavior', () => {
    expect(requiresApproval(mutationAdd())).toBe(true);
    expect(
      requiresApproval(
        mutationAdd(),
        'anything-else' as 'writes',
      ),
    ).toBe(true);
  });

  it('isGatedAgentToolCall applies the passed mode', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([mutationAdd()]),
    );

    await expect(
      isGatedAgentToolCall(
        'tenant-mode-w',
        'core.trpc.customers.add',
        'writes',
      ),
    ).resolves.toBe(true);
    await expect(
      isGatedAgentToolCall(
        'tenant-mode-d',
        'core.trpc.customers.add',
        'destructive',
      ),
    ).resolves.toBe(false);
  });
});
