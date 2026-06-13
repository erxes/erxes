/**
 * Shared Jest stand-in for '@mastra/core/workflows' (Jest's CJS runtime cannot
 * load @mastra/core's chunk files — they use dynamic import() inside .cjs).
 * Mirrors Mastra's semantics for the compiler's usage: then-chaining, branch
 * (run matching arms, output keyed by arm id), parallel (same input to every
 * member, output keyed by member id), map (transform), per-step results,
 * failed-step short-circuit. The REAL engine is covered by
 * scripts/workflow-smoke.ts under plain Node.
 *
 * Not a test file — testMatch only collects *.test.ts.
 */

/** A compiled-step config as the compiler hands it to createStep. */
interface MockStepConfig {
  id: string;
  execute(args: { inputData: unknown }): Promise<unknown> | unknown;
}

/** A branch pair: [condition, committed arm workflow]. */
type MockBranchPair = [
  (args: { inputData: unknown }) => Promise<boolean> | boolean,
  MockWorkflow,
];

/** A map transform over the threaded state. */
type MockMapFn = (args: { inputData: unknown }) => Promise<unknown> | unknown;

/** One recorded node of the mock chain. */
type MockNode =
  | { kind: 'step'; step: MockStepConfig }
  | { kind: 'branch'; pairs: MockBranchPair[] }
  | { kind: 'parallel'; steps: MockStepConfig[] }
  | { kind: 'map'; fn: MockMapFn };

/** Result of one mock run. */
interface MockRunResult {
  status: string;
  result?: unknown;
  error?: unknown;
  steps: Record<string, { status: string }>;
}

/** Handle for one mock run. */
interface MockRunHandle {
  runId: string;
  start(args: { inputData: unknown }): Promise<MockRunResult>;
}

/** A committed mock workflow. */
interface MockWorkflow {
  id: string;
  createRun(): Promise<MockRunHandle>;
}

/** The fluent chain surface the compiler drives. */
interface MockChain {
  then(step: MockStepConfig): MockChain;
  sleep(ms: number): MockChain;
  branch(pairs: MockBranchPair[]): MockChain;
  parallel(steps: MockStepConfig[]): MockChain;
  map(fn: MockMapFn): MockChain;
  commit(): MockWorkflow;
}

/** Builds the '@mastra/core/workflows' module replacement for jest.mock. */
export function mockWorkflowsModule() {
  return {
    createStep: (cfg: MockStepConfig) => cfg,
    createWorkflow: ({ id }: { id: string }) => {
      const nodes: MockNode[] = [];
      const chain: MockChain = {
        // Mirrors Mastra's fluent .then() chain API; never awaited —
        // intentionally thenable-shaped, not a Promise.
        then(step: MockStepConfig /* NOSONAR */) {
          nodes.push({ kind: 'step', step });
          return chain;
        },
        sleep(_ms: number) {
          return chain;
        },
        branch(pairs: MockBranchPair[]) {
          nodes.push({ kind: 'branch', pairs });
          return chain;
        },
        parallel(steps: MockStepConfig[]) {
          nodes.push({ kind: 'parallel', steps });
          return chain;
        },
        map(fn: MockMapFn) {
          nodes.push({ kind: 'map', fn });
          return chain;
        },
        commit() {
          return {
            id,
            createRun() {
              return Promise.resolve({
                runId: 'mock-run',
                async start({ inputData }: { inputData: unknown }) {
                  let state = inputData;
                  const stepResults: Record<string, { status: string }> = {};
                  const fail = (error: unknown) => ({
                    status: 'failed',
                    error,
                    steps: stepResults,
                  });
                  for (const node of nodes) {
                    try {
                      if (node.kind === 'step') {
                        state = await node.step.execute({ inputData: state });
                        stepResults[node.step.id] = { status: 'success' };
                      } else if (node.kind === 'branch') {
                        const out: Record<string, unknown> = {};
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
                        const out: Record<string, unknown> = {};
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
                  return {
                    status: 'success',
                    result: state,
                    steps: stepResults,
                  };
                },
              });
            },
          };
        },
      };
      return chain;
    },
  };
}
