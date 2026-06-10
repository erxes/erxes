/**
 * Compiler unit tests.
 *
 * Jest's CJS runtime cannot load @mastra/core's chunk files (they use dynamic
 * import() inside .cjs), so these tests mock the workflow primitives with a
 * minimal engine mirroring Mastra's semantics for our usage: then-chaining,
 * branch (run matching arms, output keyed by arm id), parallel (same input to
 * every member, output keyed by member id), map (transform), per-step results,
 * failed-step short-circuit. The REAL Mastra execution path is covered by
 * scripts/workflow-smoke.ts, which runs under plain Node.
 */
jest.mock('@mastra/core/workflows', () => ({
  createStep: (cfg: any) => cfg,
  createWorkflow: ({ id }: any) => {
    const nodes: any[] = [];
    const chain: any = {
      then(step: any) {
        nodes.push({ kind: 'step', step });
        return chain;
      },
      sleep(_ms: number) {
        return chain;
      },
      branch(pairs: any[]) {
        nodes.push({ kind: 'branch', pairs });
        return chain;
      },
      parallel(steps: any[]) {
        nodes.push({ kind: 'parallel', steps });
        return chain;
      },
      map(fn: any) {
        nodes.push({ kind: 'map', fn });
        return chain;
      },
      commit() {
        return {
          id,
          async createRun() {
            return {
              runId: 'mock-run',
              async start({ inputData }: any) {
                let state = inputData;
                const stepResults: Record<string, any> = {};
                const fail = (error: any) => ({ status: 'failed', error, steps: stepResults });
                for (const node of nodes) {
                  try {
                    if (node.kind === 'step') {
                      state = await node.step.execute({ inputData: state });
                      stepResults[node.step.id] = { status: 'success' };
                    } else if (node.kind === 'branch') {
                      const out: Record<string, any> = {};
                      for (const [cond, target] of node.pairs) {
                        if (await cond({ inputData: state })) {
                          const run = await target.createRun();
                          const res = await run.start({ inputData: state });
                          Object.assign(stepResults, res.steps);
                          if (res.status === 'failed') return fail(res.error);
                          out[target.id] = res.result;
                        }
                      }
                      state = out;
                    } else if (node.kind === 'parallel') {
                      const out: Record<string, any> = {};
                      for (const sub of node.steps) {
                        out[sub.id] = await sub.execute({ inputData: state });
                        stepResults[sub.id] = { status: 'success' };
                      }
                      state = out;
                    } else if (node.kind === 'map') {
                      state = await node.fn({ inputData: state });
                    }
                  } catch (error) {
                    return fail(error);
                  }
                }
                return { status: 'success', result: state, steps: stepResults };
              },
            };
          },
        };
      },
    };
    return chain;
  },
}));

import { compileDefinition, CompiledDeps, finalOutput } from '../compiler';
import { WorkflowDefinition } from '../dsl';
import { buildManualEnvelope } from '../envelope';

const linearDef = (): WorkflowDefinition =>
  ({
    trigger: { type: 'manual', config: {} },
    policy: { mode: 'all', allowed: [] },
    bindings: { judge: { kind: 'agent', id: 'agent-1' } },
    limits: { maxLlmCalls: 10 },
    steps: [
      {
        id: 'classify',
        type: 'agent',
        agentRef: 'judge',
        prompt: 'Customer said: {{trigger.payload.text}}',
        outputSchema: { intent: 'enum:order,question', productName: 'string?' },
      },
      {
        id: 'create',
        type: 'operation',
        operation: 'dealsAdd',
        args: { name: 'Order: {{steps.classify.output.productName}}' },
      },
      { id: 'done', type: 'end', output: { dealId: '{{steps.create.output._id}}' } },
    ],
  }) as any;

const branchDef = (): WorkflowDefinition =>
  ({
    trigger: { type: 'manual', config: {} },
    policy: { mode: 'all', allowed: [] },
    bindings: { judge: { kind: 'agent', id: 'agent-1' } },
    limits: { maxLlmCalls: 10 },
    steps: [
      {
        id: 'classify',
        type: 'agent',
        agentRef: 'judge',
        prompt: '{{trigger.payload.text}}',
        outputSchema: { intent: 'enum:order,question,complaint' },
      },
      {
        id: 'route',
        type: 'branch',
        branches: [
          {
            when: "{{steps.classify.output.intent}} == 'order'",
            steps: [
              { id: 'createDeal', type: 'operation', operation: 'dealsAdd', args: { name: 'deal' } },
            ],
          },
          {
            when: "{{steps.classify.output.intent}} == 'complaint'",
            steps: [
              { id: 'createTicket', type: 'operation', operation: 'ticketsAdd', args: {} },
            ],
          },
        ],
        else: [{ id: 'logOther', type: 'operation', operation: 'logsAdd', args: {} }],
      },
      {
        id: 'notify',
        type: 'operation',
        operation: 'notify',
        args: { dealId: '{{steps.createDeal.output._id}}', taken: '{{steps.route.output.taken}}' },
      },
    ],
  }) as any;

const parallelDef = (): WorkflowDefinition =>
  ({
    trigger: { type: 'manual', config: {} },
    policy: { mode: 'all', allowed: [] },
    bindings: {},
    limits: { maxLlmCalls: 10 },
    steps: [
      {
        id: 'fan',
        type: 'parallel',
        steps: [
          { id: 'fetchA', type: 'operation', operation: 'customers', args: { q: 'a' } },
          { id: 'fetchB', type: 'operation', operation: 'companies', args: { q: 'b' } },
        ],
      },
      {
        id: 'combine',
        type: 'operation',
        operation: 'merge',
        args: { a: '{{steps.fetchA.output.n}}', b: '{{steps.fetchB.output.n}}' },
      },
    ],
  }) as any;

const run = async (def: WorkflowDefinition, deps: CompiledDeps, payload: any) => {
  const wf: any = compileDefinition('test_wf', def, deps);
  const handle = await wf.createRun();
  return handle.start({
    inputData: { trigger: buildManualEnvelope(payload, 'u1'), steps: {} },
  });
};

describe('workflow compiler — linear', () => {
  it('runs agent → operation → end, threading refs through state', async () => {
    const calls: any[] = [];
    const deps: CompiledDeps = {
      executeOperation: async (operation, args) => {
        calls.push({ operation, args });
        return { _id: 'deal-9', name: args.name };
      },
      runJudgment: async ({ prompt, agentBindingId }) => {
        calls.push({ prompt, agentBindingId });
        return { intent: 'order', productName: 'Chair' };
      },
    };

    const result: any = await run(linearDef(), deps, { text: 'I want a chair' });

    expect(result.status).toBe('success');
    expect(calls[0].prompt).toBe('Customer said: I want a chair');
    expect(calls[0].agentBindingId).toBe('agent-1');
    expect(calls[1]).toEqual({ operation: 'dealsAdd', args: { name: 'Order: Chair' } });
    expect(finalOutput(linearDef(), result.result)).toEqual({ dealId: 'deal-9' });
    expect(result.steps.classify.status).toBe('success');
    expect(result.steps.create.status).toBe('success');
  });

  it('fails the run when judgment output violates its declared schema', async () => {
    const deps: CompiledDeps = {
      executeOperation: async () => ({}),
      runJudgment: async () => ({ intent: 'refund' }), // not in enum
    };

    const result: any = await run(linearDef(), deps, { text: 'hi' });
    expect(result.status).toBe('failed');
    expect(String(result.error?.message || result.error)).toMatch(/not matching its schema/);
    expect(result.steps.create).toBeUndefined();
  });

  it('fails the run when an operation handler throws (policy violation path)', async () => {
    const deps: CompiledDeps = {
      executeOperation: async () => {
        throw new Error('operation "dealsAdd" is outside this workflow\'s policy');
      },
      runJudgment: async () => ({ intent: 'order', productName: 'Chair' }),
    };

    const result: any = await run(linearDef(), deps, { text: 'hi' });
    expect(result.status).toBe('failed');
    expect(String(result.error?.message || result.error)).toMatch(/outside this workflow's policy/);
  });

  it('refuses to compile an invalid definition', () => {
    const bad = linearDef();
    (bad.steps[0] as any).agentRef = 'ghost';
    expect(() =>
      compileDefinition('bad_wf', bad, {
        executeOperation: async () => ({}),
        runJudgment: async () => ({}),
      }),
    ).toThrow(/Cannot compile invalid definition/);
  });
});

describe('workflow compiler — branch', () => {
  const mkDeps = (intent: string, ops: any[]): CompiledDeps => ({
    executeOperation: async (operation, args) => {
      ops.push({ operation, args });
      return { _id: `${operation}-id` };
    },
    runJudgment: async () => ({ intent }),
  });

  it('takes the first matching arm and records it on the branch output', async () => {
    const ops: any[] = [];
    const result: any = await run(branchDef(), mkDeps('order', ops), { text: 'buy' });

    expect(result.status).toBe('success');
    expect(ops.map((o) => o.operation)).toEqual(['dealsAdd', 'notify']);
    // Post-branch step saw the arm's output AND which arm ran.
    expect(ops[1].args).toEqual({ dealId: 'dealsAdd-id', taken: 'test_wf_route_b0' });
    expect(result.steps.createDeal.status).toBe('success');
  });

  it('routes to a later arm when earlier conditions are false', async () => {
    const ops: any[] = [];
    const result: any = await run(branchDef(), mkDeps('complaint', ops), { text: 'bad' });

    expect(result.status).toBe('success');
    expect(ops.map((o) => o.operation)).toEqual(['ticketsAdd', 'notify']);
    // The untaken arm's ref resolves to undefined — never crashes.
    expect(ops[1].args.dealId).toBeUndefined();
  });

  it('falls through to else when no condition matches', async () => {
    const ops: any[] = [];
    const result: any = await run(branchDef(), mkDeps('question', ops), { text: '?' });

    expect(result.status).toBe('success');
    expect(ops.map((o) => o.operation)).toEqual(['logsAdd', 'notify']);
  });

  it('passes state through untouched when no arm matches and there is no else', async () => {
    const def = branchDef();
    delete (def.steps[1] as any).else;
    const ops: any[] = [];
    const result: any = await run(def, mkDeps('question', ops), { text: '?' });

    expect(result.status).toBe('success');
    expect(ops.map((o) => o.operation)).toEqual(['notify']);
  });

  it('propagates an arm failure to the whole run', async () => {
    const deps: CompiledDeps = {
      executeOperation: async () => {
        throw new Error('boom inside arm');
      },
      runJudgment: async () => ({ intent: 'order' }),
    };
    const result: any = await run(branchDef(), deps, { text: 'buy' });
    expect(result.status).toBe('failed');
    expect(String(result.error?.message || result.error)).toMatch(/boom inside arm/);
  });
});

describe('workflow compiler — parallel', () => {
  it('fans out with the same input state and merges member outputs', async () => {
    const ops: any[] = [];
    const deps: CompiledDeps = {
      executeOperation: async (operation, args) => {
        ops.push({ operation, args });
        return { n: operation.length };
      },
      runJudgment: async () => ({}),
    };

    const result: any = await run(parallelDef(), deps, {});

    expect(result.status).toBe('success');
    expect(ops.map((o) => o.operation).sort()).toEqual(['companies', 'customers', 'merge']);
    // Post-parallel step read BOTH members' outputs from merged state.
    const merge = ops.find((o) => o.operation === 'merge');
    expect(merge.args).toEqual({ a: 'customers'.length, b: 'companies'.length });
    expect(finalOutput(parallelDef(), result.result)).toEqual({ n: 'merge'.length }); // last step's output
    expect(result.result.steps.fan.output).toEqual({ completed: ['fetchA', 'fetchB'] });
  });
});
