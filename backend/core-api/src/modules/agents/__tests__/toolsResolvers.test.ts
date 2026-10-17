/**
 * `agentsTools` catalog resolver tests.
 *
 * Guarantees under test:
 *
 * - the catalog is gated behind `showAgents`;
 * - `requiresApproval` flags destructive tools and always-confirm ids;
 * - `allowed` reflects the acting user's permission (checked per action,
 *   once per action) and is false when the tool declares no permission;
 * - plugin failures surface only as names in `unavailablePlugins` — never
 *   error messages;
 * - `inputSchema` never reaches the response.
 */

import { agentsToolsQueries } from '@/agents/graphql/resolvers/queries/tools';
import { listAgentToolManifests } from '@/agents/agentTools';
import type { IAgentToolDescriptor } from '@/agents/agentTools';
import type { IContext } from '~/connectionResolvers';

jest.mock('@/agents/agentTools', () => ({
  listAgentToolManifests: jest.fn(),
  callAgentTool: jest.fn(),
}));

const mockedManifests = listAgentToolManifests as jest.MockedFunction<
  typeof listAgentToolManifests
>;

const buildContext = ({
  allowedActions = new Set<string>(),
  userId = 'user-1',
  approvalMode = 'writes',
}: {
  allowedActions?: Set<string>;
  userId?: string;
  approvalMode?: 'writes' | 'destructive';
} = {}) => {
  const checkPermission = jest.fn(async (action: string) => {
    if (!allowedActions.has(action)) {
      throw new Error('Permission denied');
    }
  });

  const ctx = {
    checkPermission,
    user: { _id: userId },
    subdomain: 'tenant',
    models: {
      AgentsSettings: {
        getSettings: jest.fn(async () => ({
          codeModeEnabled: false,
          codeModeEnvironment: 'in-process',
          approvalMode,
        })),
      },
    },
  } as unknown as IContext;

  return { ctx, checkPermission };
};

const descriptor = (
  overrides: Partial<IAgentToolDescriptor>,
): IAgentToolDescriptor => ({
  id: 'sales.trpc.deal.find',
  kind: 'trpc',
  plugin: 'sales',
  module: 'sales',
  method: 'query',
  destructive: false,
  description: 'Find deals',
  inputFields: [{ name: 'query', type: 'string', required: false }],
  inputSchema: { type: 'object' },
  permission: { module: 'sales', action: 'dealsShow' },
  path: 'deal.find',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockedManifests.mockResolvedValue({ manifests: [], failures: [] });
});

describe('agentsTools query', () => {
  it('requires showAgents before loading manifests', async () => {
    const { ctx } = buildContext({ allowedActions: new Set() });

    await expect(
      agentsToolsQueries.agentsTools(undefined, {}, ctx),
    ).rejects.toThrow('Permission denied');
    expect(mockedManifests).not.toHaveBeenCalled();
  });

  it('marks tools allowed only when the user holds the declared action', async () => {
    const { ctx, checkPermission } = buildContext({
      allowedActions: new Set(['showAgents', 'dealsShow']),
    });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'sales',
          tools: [
            descriptor({}),
            descriptor({
              id: 'sales.trpc.deal.remove',
              path: 'deal.remove',
              method: 'mutation',
              destructive: true,
              permission: { module: 'sales', action: 'dealsRemove' },
              description: 'Remove a deal',
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);

    const findTool = result.tools.find((t) => t.id === 'sales.trpc.deal.find');
    const removeTool = result.tools.find(
      (t) => t.id === 'sales.trpc.deal.remove',
    );

    expect(findTool?.allowed).toBe(true);
    expect(findTool?.requiresApproval).toBe(false);
    expect(removeTool?.allowed).toBe(false);
    expect(removeTool?.requiresApproval).toBe(true);
    expect(checkPermission).toHaveBeenCalledWith('dealsShow');
    expect(checkPermission).toHaveBeenCalledWith('dealsRemove');
  });

  it('marks permission-less tools as not allowed and never checks', async () => {
    const { ctx, checkPermission } = buildContext({
      allowedActions: new Set(['showAgents']),
    });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'core',
          tools: [descriptor({ id: 'core.trpc.x.y', path: 'x.y', plugin: 'core', permission: null })],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);

    expect(result.tools[0].allowed).toBe(false);
    expect(checkPermission).toHaveBeenCalledTimes(1); // showAgents only
  });

  it('flags always-confirm tools even when not destructive', async () => {
    const { ctx } = buildContext({
      allowedActions: new Set(['showAgents', 'conversationsManage']),
    });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'frontline',
          tools: [
            descriptor({
              id: 'frontline.trpc.inbox.conversations.changeStatus',
              plugin: 'frontline',
              module: 'inbox',
              path: 'inbox.conversations.changeStatus',
              method: 'query',
              destructive: false,
              permission: { module: 'frontline', action: 'conversationsManage' },
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);

    expect(result.tools[0].requiresApproval).toBe(true);
  });

  it('reports unreachable plugins by name only', async () => {
    const { ctx } = buildContext({ allowedActions: new Set(['showAgents']) });
    mockedManifests.mockResolvedValue({
      manifests: [
        { plugin: 'core', tools: [descriptor({ plugin: 'core', id: 'core.trpc.a.b', path: 'a.b' })] },
      ],
      failures: [
        { plugin: 'frontline', error: 'ECONNREFUSED 10.0.0.5:3304' },
      ],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);

    expect(result.unavailablePlugins).toEqual(['frontline']);
    expect(JSON.stringify(result)).not.toContain('ECONNREFUSED');
    expect(JSON.stringify(result)).not.toContain('10.0.0.5');
  });

  it('never exposes inputSchema and sorts by plugin then path', async () => {
    const { ctx } = buildContext({ allowedActions: new Set(['showAgents']) });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'sales',
          tools: [
            descriptor({ id: 'sales.trpc.deal.b', path: 'deal.b' }),
            descriptor({ id: 'sales.trpc.deal.a', path: 'deal.a' }),
          ],
        },
        {
          plugin: 'core',
          tools: [descriptor({ plugin: 'core', id: 'core.trpc.a.z', path: 'a.z' })],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);

    expect(result.tools.map((t) => t.id)).toEqual([
      'core.trpc.a.z',
      'sales.trpc.deal.a',
      'sales.trpc.deal.b',
    ]);
    expect(JSON.stringify(result)).not.toContain('inputSchema');
    expect(result.tools[0]).not.toHaveProperty('inputSchema');
  });
});

describe('agentsTools inputFields type derivation', () => {
  it('maps Zod class names to display types and erases wrappers to any', async () => {
    const { ctx } = buildContext({ allowedActions: new Set(['showAgents']) });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'core',
          tools: [
            descriptor({
              id: 'core.trpc.x.y',
              path: 'x.y',
              plugin: 'core',
              permission: null,
              inputFields: [
                { name: 'q', type: 'ZodString', required: true },
                { name: 'n', type: 'ZodNumber', required: false },
                { name: 'flag', type: 'ZodBoolean', required: false },
                { name: 'ids', type: 'ZodArray', required: true },
                { name: 'filter', type: 'ZodObject', required: false },
                { name: 'kind', type: 'ZodEnum', required: true },
                { name: 'when', type: 'ZodDate', required: false },
                { name: 'maybe', type: 'ZodOptional', required: false },
                { name: 'mystery', type: 'ZodWeirdNewThing', required: false },
              ],
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);
    const fields = result.tools[0].inputFields;

    expect(fields).toEqual([
      { name: 'q', type: 'string', required: true },
      { name: 'n', type: 'number', required: false },
      { name: 'flag', type: 'boolean', required: false },
      { name: 'ids', type: 'array', required: true },
      { name: 'filter', type: 'object', required: false },
      { name: 'kind', type: 'enum', required: true },
      { name: 'when', type: 'date', required: false },
      { name: 'maybe', type: 'any', required: false },
      { name: 'mystery', type: 'any', required: false },
    ]);
    expect(JSON.stringify(result)).not.toMatch(/Zod[A-Z]/);
  });

  it('derives types and required from inputSchema when present', async () => {
    const { ctx } = buildContext({ allowedActions: new Set(['showAgents']) });
    mockedManifests.mockResolvedValue({
      manifests: [
        {
          plugin: 'core',
          tools: [
            descriptor({
              id: 'core.trpc.x.z',
              path: 'x.z',
              plugin: 'core',
              permission: null,
              inputFields: [
                { name: 'q', type: 'ZodString', required: true },
                { name: 'status', type: 'ZodEnum', required: false },
                { name: 'maybe', type: 'ZodOptional', required: true },
                { name: 'tags', type: 'ZodArray', required: false },
              ],
              inputSchema: {
                type: 'object',
                properties: {
                  q: { type: 'string' },
                  status: { enum: ['open', 'closed'] },
                  maybe: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                  tags: { type: 'array', items: { type: 'string' } },
                },
                required: ['q', 'tags'],
              },
            }),
          ],
        },
      ],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);
    const fields = result.tools[0].inputFields;

    expect(fields).toEqual([
      { name: 'q', type: 'string', required: true },
      { name: 'status', type: 'enum', required: false },
      { name: 'maybe', type: 'string', required: false },
      { name: 'tags', type: 'array', required: true },
    ]);
    expect(result.tools[0]).not.toHaveProperty('inputSchema');
  });
});

describe('agentsTools approval mode', () => {
  const mutationTool = () =>
    descriptor({
      id: 'sales.trpc.deal.update',
      path: 'deal.update',
      method: 'mutation',
      destructive: false,
      description: 'Update a deal',
    });

  it("marks every mutation as requiresApproval when the tenant uses 'writes'", async () => {
    const { ctx } = buildContext({
      allowedActions: new Set(['showAgents', 'dealsUpdate']),
      approvalMode: 'writes',
    });
    mockedManifests.mockResolvedValue({
      manifests: [{ plugin: 'sales', tools: [mutationTool()] }],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);
    expect(result.tools[0].requiresApproval).toBe(true);
  });

  it("leaves a plain mutation ungated when the tenant uses 'destructive'", async () => {
    const { ctx } = buildContext({
      allowedActions: new Set(['showAgents', 'dealsUpdate']),
      approvalMode: 'destructive',
    });
    mockedManifests.mockResolvedValue({
      manifests: [{ plugin: 'sales', tools: [mutationTool()] }],
      failures: [],
    });

    const result = await agentsToolsQueries.agentsTools(undefined, {}, ctx);
    expect(result.tools[0].requiresApproval).toBe(false);
  });
});
