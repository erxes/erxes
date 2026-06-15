/**
 * execute_erxes_operation: the destructive-ops guard and the audit-trail
 * recording. Mastra's createTool and the network executor are mocked so the
 * test drives the tool's own logic directly.
 */
jest.mock('@mastra/core/tools', () => ({ createTool: (cfg: unknown) => cfg }));

const mockExecute = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ ok: true }),
);
jest.mock('../erxesTools', () => ({
  executeErxesOperation: (...args: unknown[]) => mockExecute(...args),
  graphqlTypeToString: () => 'String',
}));

import { buildErxesMetaTools } from '../metaTools';
import type { OperationRegistry, OperationMeta } from '../operationRegistry';
import type { AgentActionInput } from '../auditLog';

const mkRegistry = (ops: Array<Partial<OperationMeta>>): OperationRegistry => {
  const list = ops.map(
    (o) =>
      ({
        operation: o.operation || 'x',
        operationType: o.operationType || 'mutation',
        plugin: o.plugin || 'core',
        module: o.module || 'customers',
        description: '',
        graphqlArgs: [],
        returnType: null,
      }) as OperationMeta,
  );
  return {
    operations: new Map(list.map((o) => [o.operation, o])),
    list,
    inputTypesMap: {},
    objectFieldsMap: {},
  };
};

interface ToolLike {
  execute: (
    input: unknown,
  ) => Promise<{ blocked?: boolean } & Record<string, unknown>>;
}

const build = (
  ops: Array<Partial<OperationMeta>>,
  destructiveOps: 'allow' | 'block',
  calls: AgentActionInput[],
) =>
  buildErxesMetaTools({
    registry: mkRegistry(ops),
    settings: {},
    policy: { mode: 'all', allowed: [] },
    destructiveOps,
    recordAction: (entry) => calls.push(entry),
  }).execute_erxes_operation as unknown as ToolLike;

beforeEach(() => mockExecute.mockClear());

describe('execute_erxes_operation guard + audit', () => {
  it('blocks a destructive op, records it, and never executes it', async () => {
    const calls: AgentActionInput[] = [];
    const tool = build(
      [{ operation: 'customersRemove', operationType: 'mutation' }],
      'block',
      calls,
    );

    const res = await tool.execute({
      operation: 'customersRemove',
      args: { _ids: ['c1'] },
    });

    expect(res.blocked).toBe(true);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      operation: 'customersRemove',
      destructive: true,
      status: 'blocked',
    });
    // Nothing executed → no correlation id.
    expect(calls[0].processId).toBeUndefined();
  });

  it("records a successful mutation (with a correlation id) when destructiveOps is 'allow'", async () => {
    const calls: AgentActionInput[] = [];
    const tool = build(
      [{ operation: 'customersRemove', operationType: 'mutation' }],
      'allow',
      calls,
    );

    await tool.execute({ operation: 'customersRemove', args: {} });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    // The processId is the 6th arg to executeErxesOperation and is recorded.
    const sentProcessId = mockExecute.mock.calls[0][5] as string;
    expect(sentProcessId).toMatch(/^agt_/);
    expect(calls[0]).toMatchObject({
      operation: 'customersRemove',
      destructive: true,
      status: 'success',
      processId: sentProcessId,
    });
  });

  it('records a failed mutation when the executor returns success:false', async () => {
    mockExecute.mockResolvedValueOnce({
      success: false,
      error: 'boom',
    } as never);
    const calls: AgentActionInput[] = [];
    const tool = build(
      [{ operation: 'dealsEdit', operationType: 'mutation' }],
      'block',
      calls,
    );

    await tool.execute({ operation: 'dealsEdit', args: {} });

    expect(calls[0]).toMatchObject({ status: 'failed', error: 'boom' });
  });

  it('does not record reads (queries)', async () => {
    const calls: AgentActionInput[] = [];
    const tool = build(
      [{ operation: 'customers', operationType: 'query' }],
      'block',
      calls,
    );

    await tool.execute({ operation: 'customers', args: {} });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    // Reads get no correlation id (nothing to revert).
    expect(mockExecute.mock.calls[0][5]).toBeUndefined();
    expect(calls).toHaveLength(0);
  });
});
