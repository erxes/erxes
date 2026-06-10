/**
 * Compiler unit tests.
 *
 * Jest's CJS runtime cannot load @mastra/core's chunk files (they use dynamic
 * import() inside .cjs), so these tests mock the two workflow primitives with
 * a minimal linear engine that mirrors Mastra's semantics for our usage
 * (then-chaining, per-step results, failed-step short-circuit). The REAL
 * Mastra execution path is covered by scripts/workflow-smoke.ts, which runs
 * under plain Node.
 */
jest.mock('@mastra/core/workflows', () => ({
  createStep: (cfg: any) => cfg,
  createWorkflow: ({ id }: any) => {
    const steps: any[] = [];
    const chain: any = {
      then(step: any) {
        steps.push(step);
        return chain;
      },
      sleep(_ms: number) {
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
                for (const s of steps) {
                  try {
                    state = await s.execute({ inputData: state });
                    stepResults[s.id] = { status: 'success' };
                  } catch (error) {
                    stepResults[s.id] = { status: 'failed', error };
                    return { status: 'failed', error, steps: stepResults };
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

const run = async (def: WorkflowDefinition, deps: CompiledDeps, payload: any) => {
  const wf: any = compileDefinition('test_wf', def, deps);
  const handle = await wf.createRun();
  return handle.start({
    inputData: { trigger: buildManualEnvelope(payload, 'u1'), steps: {} },
  });
};

describe('workflow compiler', () => {
  it('runs a linear agent → operation → end flow, threading refs through state', async () => {
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
    // Refs resolved: trigger payload into the prompt, judgment output into args.
    expect(calls[0].prompt).toBe('Customer said: I want a chair');
    expect(calls[0].agentBindingId).toBe('agent-1');
    expect(calls[1]).toEqual({ operation: 'dealsAdd', args: { name: 'Order: Chair' } });
    // The end step's declared output is the workflow's final output.
    expect(finalOutput(linearDef(), result.result)).toEqual({ dealId: 'deal-9' });
    // Per-step results are reported.
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
    // The downstream operation never executed.
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
