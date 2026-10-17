/**
 * Code mode tests.
 *
 * The guarantees under test:
 *
 * - the sandbox executes model-authored TypeScript and returns its result
 *   and captured console output (real QuickJS run — the WASM interpreter is
 *   pure JS and needs no native build);
 * - the guest has NO host capabilities: `require`, `process`, and `fetch`
 *   are all invisible inside the sandbox;
 * - `external_callTool` executes a safe tool as the acting user (identity
 *   forwarded from the request context, never model-provided);
 * - an approval-gated tool id (destructive, or always-confirm) is refused
 *   with a readable APPROVAL_REQUIRED result — sandboxed programs bypass
 *   Mastra's requireApproval suspension, so this wrapper is the gate;
 * - the tool registers under the default `execute_typescript` id with
 *   non-empty instructions for the agent prompt.
 */

import { buildCodeModeAddition } from '@/agents/codeMode';
import { listAgentToolManifests } from '@/agents/agentTools';
import type { IAgentToolDescriptor } from '@/agents/agentTools';

jest.mock('@/agents/agentTools', () => ({
  callAgentTool: jest.fn(),
  listAgentToolManifests: jest.fn(),
}));

// Keep the REAL createCodeMode pipeline (stub generation, QuickJS transport,
// dispatcher) — that is what is under test — but bypass createTool's
// execution wrapper so the tests can drive the raw execute with a
// hand-built context, exactly like tools.test.ts.
jest.mock('@mastra/core/tools', () => {
  const actual = jest.requireActual('@mastra/core/tools') as Record<
    string,
    unknown
  >;

  return { ...actual, createTool: (definition: unknown) => definition };
});

import { callAgentTool } from '@/agents/agentTools';

const mockedCallAgentTool = callAgentTool as jest.MockedFunction<
  typeof callAgentTool
>;
const mockedListAgentToolManifests = listAgentToolManifests as jest.MockedFunction<
  typeof listAgentToolManifests
>;

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

const SUBDOMAIN = 'tenant-codetest';
const USER_ID = 'user-codetest';

// Each test uses its own subdomain: the tool bridge caches manifests per
// subdomain for 60s, so shared subdomains would leak descriptors across
// tests (a read-only cache hit would defeat the gated-refusal assertions).
const buildContext = (
  subdomain: string = SUBDOMAIN,
  approvalMode?: 'writes' | 'destructive',
) => ({
  requestContext: {
    get: (key: string) =>
      ({ subdomain, userId: USER_ID, approvalMode }[key]),
  },
  observe: {
    span: async (_name: string, fn: () => unknown) => fn(),
  },
});

interface ICodeModeTool {
  id: string;
  execute: (input: { code: string }, ctx: unknown) => Promise<{
    success: boolean;
    result?: unknown;
    logs?: string[];
    error?: { message: string };
  }>;
}

let codeModeTool: ICodeModeTool;
let instructions: string;

beforeAll(async () => {
  const addition = await buildCodeModeAddition();

  instructions = addition.instructions;
  codeModeTool = addition.tool as unknown as ICodeModeTool;
});

beforeEach(() => {
  mockedCallAgentTool.mockReset();
  mockedListAgentToolManifests.mockReset();
});

const runProgram = async (
  code: string,
  subdomain?: string,
  approvalMode?: 'writes' | 'destructive',
) => {
  if (!codeModeTool.execute) {
    throw new Error('code mode tool has no execute');
  }

  return codeModeTool.execute(
    { code },
    buildContext(subdomain, approvalMode),
  );
};

describe('sandbox execution', () => {
  it('executes a TypeScript program and returns its result', async () => {
    const result = await runProgram('return 1 + 1;');

    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it('captures console output in order', async () => {
    const result = await runProgram(
      'console.log("first"); console.warn("second"); return "done";',
    );

    expect(result.success).toBe(true);
    expect(result.logs?.join('\n')).toContain('first');
    expect(result.logs?.join('\n')).toContain('second');
  });

  it('reports a throwing program as a readable failure', async () => {
    const result = await runProgram('throw new Error("boom");');

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('boom');
  });

  it('exposes no host capabilities inside the sandbox', async () => {
    const result = await runProgram(
      'return [typeof require, typeof process, typeof fetch].join("|");',
    );

    expect(result.success).toBe(true);
    expect(result.result).toBe('undefined|undefined|undefined');
  });
});

describe('external_callTool bridge', () => {
  it('executes a safe tool as the acting user from the request context', async () => {
    mockedListAgentToolManifests.mockResolvedValue(manifest([baseDescriptor()]));
    mockedCallAgentTool.mockResolvedValue({ total: 7 });

    const result = await runProgram(
      'const r = await external_callTool({ toolId: "sales.trpc.deal.count" }); return r;',
    );

    expect(result.success).toBe(true);
    expect(result.result).toEqual({ status: 'ok', result: { total: 7 } });
    expect(mockedCallAgentTool).toHaveBeenCalledWith({
      subdomain: SUBDOMAIN,
      userId: USER_ID,
      toolId: 'sales.trpc.deal.count',
      input: undefined,
    });
  });

  it('refuses an approval-gated tool id instead of executing it', async () => {
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

    const result = await runProgram(
      'const r = await external_callTool({ toolId: "sales.trpc.deal.remove" }); return r;',
      'tenant-codetest-gated-d',
    );

    expect(result.success).toBe(true);
    expect(result.result as Record<string, unknown>).toMatchObject({
      status: 'error',
      code: 'APPROVAL_REQUIRED',
    });
    expect(
      String((result.result as Record<string, unknown>).error),
    ).toContain('requires user approval');
    expect(mockedCallAgentTool).not.toHaveBeenCalled();
  });

  it('refuses a plain mutation in writes mode but allows it in destructive mode', async () => {
    mockedListAgentToolManifests.mockResolvedValue(
      manifest([
        baseDescriptor({
          id: 'sales.trpc.deal.update',
          description: 'Update a deal',
          path: 'deal.update',
          method: 'mutation',
          destructive: false,
        }),
      ]),
    );
    mockedCallAgentTool.mockResolvedValue({ ok: true });

    const writes = await runProgram(
      'const r = await external_callTool({ toolId: "sales.trpc.deal.update" }); return r;',
      'tenant-codetest-writes',
      'writes',
    );
    expect(writes.result).toMatchObject({ code: 'APPROVAL_REQUIRED' });
    expect(mockedCallAgentTool).not.toHaveBeenCalled();

    mockedCallAgentTool.mockClear();
    const destructive = await runProgram(
      'const r = await external_callTool({ toolId: "sales.trpc.deal.update" }); return r;',
      'tenant-codetest-destructive',
      'destructive',
    );
    expect(destructive.result).toMatchObject({ status: 'ok' });
    expect(mockedCallAgentTool).toHaveBeenCalled();
  });

  it('refuses an always-confirm tool id inside the sandbox', async () => {
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

    const result = await runProgram(
      'const r = await external_callTool({ toolId: "frontline.trpc.inbox.conversations.changeStatus" }); return r;',
      'tenant-codetest-gated-ac',
    );

    expect(result.result).toMatchObject({ code: 'APPROVAL_REQUIRED' });
    expect(mockedCallAgentTool).not.toHaveBeenCalled();
  });
});

describe('registration', () => {
  it('registers under the default id with agent-facing instructions', () => {
    expect(codeModeTool.id).toBe('execute_typescript');
    expect(typeof instructions).toBe('string');
    expect(instructions).toContain('external_');
  });
});
