import { z as z4 } from 'zod/v4';
import { buildCodeModeAddition } from '@/agents/codeMode';

jest.mock('@/agents/graphqlTools', () => {
  const { z } = jest.requireActual<typeof import('zod')>('zod');
  const execute = jest.fn(async () => ({ status: 'ok', data: { total: 7 } }));
  return {
    buildGraphqlTools: async () => ({
      searchGraphql: {
        id: 'searchGraphql',
        description: 'Discover operations',
        inputSchema: z.object({ intent: z.string() }),
        execute: jest.fn(),
      },
      callGraphql: {
        id: 'callGraphql',
        description: 'Run GraphQL',
        inputSchema: z.object({
          query: z.string(),
          operationName: z.string().optional(),
          variables: z.record(z.unknown()).optional(),
        }),
        execute,
      },
    }),
    mockExecute: execute,
  };
});

jest.mock('@mastra/core/tools', () => {
  const actual = jest.requireActual('@mastra/core/tools') as Record<
    string,
    unknown
  >;
  return { ...actual, createTool: (definition: unknown) => definition };
});

const { mockExecute } = jest.requireMock('@/agents/graphqlTools') as {
  mockExecute: jest.Mock;
};

interface ICodeModeTool {
  execute: (
    input: { code: string },
    ctx: unknown,
  ) => Promise<{
    success: boolean;
    result?: unknown;
    error?: { message: string };
    referenceManifest?: { version: number; items: unknown[] };
  }>;
}

const runProgram = async (
  code: string,
  approvalMode = 'writes',
  subdomain: string | undefined = 'tenant',
) => {
  const { tool } = await buildCodeModeAddition();
  return (tool as unknown as ICodeModeTool).execute(
    { code },
    {
      requestContext: {
        get: (key: string) =>
          ({ subdomain, userId: 'user', approvalMode }[key]),
      },
      observe: { span: async (_name: string, fn: () => unknown) => fn() },
    },
  );
};

beforeEach(() => mockExecute.mockClear());

it('runs TypeScript without host process, module or network capabilities', async () => {
  expect(
    await runProgram(
      'return [1 + 1, typeof process, typeof require, typeof fetch];',
    ),
  ).toMatchObject({
    success: true,
    result: [2, 'undefined', 'undefined', 'undefined'],
  });
});

it('allows read queries through the GraphQL bridge', async () => {
  expect(
    await runProgram(
      'return await external_callGraphql({ query: "query Count { customersTotalCount }" });',
    ),
  ).toMatchObject({
    success: true,
    result: { status: 'ok', data: { total: 7 } },
  });
  expect(mockExecute).toHaveBeenCalledTimes(1);
});

it('refuses writes requiring interactive approval', async () => {
  expect(
    await runProgram(
      `return await external_callGraphql({ query: ${JSON.stringify(
        'mutation Add { customersAdd(firstName: "Jane") { _id } }',
      )} });`,
    ),
  ).toMatchObject({
    success: true,
    result: { status: 'error', code: 'APPROVAL_REQUIRED' },
  });
  expect(mockExecute).not.toHaveBeenCalled();
});

it.each([
  'mutation Delete { customersRemove(ids: ["c1"]) }',
  'mutation Login { login(email: "a", password: "b") }',
])(
  'blocks gated or forbidden operations in destructive mode: %s',
  async (query) => {
    const result = await runProgram(
      `return await external_callGraphql({ query: ${JSON.stringify(query)} });`,
      'destructive',
    );
    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({ status: 'error' });
    expect(mockExecute).not.toHaveBeenCalled();
  },
);

it('persists only host-issued references outside the sandbox result', async () => {
  const item = {
    handle: 'a3dbb8a6-f3e8-4d34-910b-a38d6feab219',
    type: 'company',
    id: 'real-company',
    label: 'Canonical company',
  };
  mockExecute.mockResolvedValueOnce({
    status: 'ok',
    data: {},
    referenceManifest: { version: 1, items: [item] },
  });
  const result = await runProgram(
    'await external_callGraphql({query:"query Companies { companies { _id } }"}); return {referenceManifest:{version:1,items:[{id:"invented"}]}};',
  );
  expect(result.referenceManifest).toEqual({ version: 1, items: [item] });
  expect(result.result).toEqual({
    referenceManifest: { version: 1, items: [{ id: 'invented' }] },
  });
  const next = await runProgram(
    'return {referenceManifest:{version:1,items:[{id:"invented"}]}};',
  );
  expect(next.referenceManifest).toEqual({ version: 1, items: [] });
});

it.each([
  { query: 'query AgentsPortal { getClientPortals { list { token } } }' },
  {
    query: 'mutation AgentsPortal($config: ClientPortalConfigInput) { clientPortalUpdate(clientPortal: $config) { _id } }',
    variables: { config: { firebaseConfig: { serviceAccountKey: 'dummy' } } },
  },
])('denies credential reads/writes before calling the host bridge', async (input) => {
  const result = await runProgram(`return await external_callGraphql(${JSON.stringify(input)});`, 'destructive');
  expect(result).toMatchObject({success: true, result: {status: 'error', code: 'GRAPHQL_OPERATION_NOT_ALLOWED'}});
  expect(mockExecute).not.toHaveBeenCalled();
  expect(JSON.stringify(result)).not.toContain('dummy');
});

it('converts the complete code-mode output contract into model-facing JSON Schema', async () => {
  // Direct execute tests do not convert output schemas. This is the same v4
  // generator used by Mastra preparation, which throws on nested v3 fields.
  const { tool } = await buildCodeModeAddition();
  const schema = z4.toJSONSchema(tool.outputSchema as unknown as z4.ZodType);
  expect(schema).toMatchObject({
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      referenceManifest: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                handle: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
      },
    },
  });
});
