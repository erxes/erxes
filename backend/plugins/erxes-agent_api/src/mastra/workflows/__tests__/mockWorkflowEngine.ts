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
export function mockWorkflowsModule() {
  return {
    createStep: (cfg: any) => cfg,
    createWorkflow: ({ id }: any) => {
      const nodes: any[] = [];
      const chain: any = {
        // Mirrors Mastra's fluent .then() chain API; never awaited.
        then(step: any) { // NOSONAR — intentional thenable-shaped mock
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
                  const fail = (error: any) => ({
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
                  return {
                    status: 'success',
                    result: state,
                    steps: stepResults,
                  };
                },
              };
            },
          };
        },
      };
      return chain;
    },
  };
}
