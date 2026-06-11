import { z } from 'zod';
import {
  WorkflowDefinition,
  WorkflowStep,
  buildOutputZod,
  validateDefinition,
} from './dsl';
import { parseExpr, evalExpr, ExprNode } from './expr';
import { resolveValue, RefScope } from './refs';
import type { TriggerEnvelope } from './envelope';

/**
 * Compiles a validated workflow definition (declarative JSON, authored by the
 * master agent) into a real Mastra workflow graph. The definition is DATA; the
 * only executable code is this compiler and the two injected effect handlers —
 * no eval, ever (docs/WORKFLOW-SPEC.md §3).
 *
 * Supported step set: operation, agent, wait, end, branch (first-match
 * semantics over nested sequential arms), parallel (effect-step fan-out).
 *
 * Execution model: one state object threads through every step —
 *   { trigger: <envelope>, steps: { <id>: { output } } }
 * Each compiled step resolves its `{{ refs }}` against that state, performs its
 * effect through the injected deps, and returns the state extended with its own
 * output. Branch arms compile to nested workflows over the same state shape;
 * a .map() after each container re-linearizes the keyed container output back
 * into plain state, so downstream steps are container-agnostic.
 */

export interface CompiledDeps {
  /** Runs one erxes operation (policy is enforced by the implementation). */
  executeOperation(operation: string, args: Record<string, any>): Promise<any>;
  /**
   * Runs one judgment (LLM) call on the bound agent and returns the raw
   * object the model produced. Schema validation happens here in the
   * compiled step, against the definition's declared outputSchema.
   */
  runJudgment(params: {
    agentBindingId: string;
    prompt: string;
    outputSpec: Record<string, string>;
  }): Promise<Record<string, any>>;
}

interface WorkflowState {
  trigger: TriggerEnvelope;
  steps: Record<string, { output: any }>;
}

const stateSchema = z.object({
  trigger: z.any(),
  steps: z.record(z.any()),
});

const withOutput = (
  state: WorkflowState,
  id: string,
  output: any,
): WorkflowState => ({
  trigger: state.trigger,
  steps: { ...state.steps, [id]: { output } },
});

/**
 * Definition → committed Mastra workflow.
 *
 * ⚠️ DELIBERATELY SYNCHRONOUS, and the returned Workflow must NEVER be awaited
 * or returned from an async function: Mastra's Workflow has a `.then()` method
 * (the step-chaining API), so promise machinery treats it as a thenable —
 * `workflow.then(resolve, ...)` chains `resolve` as a step and the promise
 * never settles. This silently hung an entire process before being diagnosed.
 */
export function compileDefinition(
  key: string,
  definition: WorkflowDefinition,
  deps: CompiledDeps,
): any {
  const check = validateDefinition(definition);
  if (!check.ok) {
    const first = check.errors[0];
    throw new Error(
      `Cannot compile invalid definition: ${first.path}: ${first.message}`,
    );
  }

  // Lazy CJS require, NOT dynamic import(): under tsx, import() of a Mastra
  // subpath inside a CJS module resolves to the ESM build through the loader
  // hooks and deadlocks (never settles). require() deterministically picks the
  // .cjs build — the path the rest of this plugin already runs on.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createWorkflow, createStep } = require('@mastra/core/workflows');

  const mkScope = (state: WorkflowState): RefScope => ({
    trigger: state.trigger,
    steps: state.steps,
    bindings: definition.bindings,
  });

  const buildLeafStep = (step: WorkflowStep) => {
    switch (step.type) {
      case 'operation':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: any) => {
            const state = inputData as WorkflowState;
            const args = resolveValue((step as any).args || {}, mkScope(state));
            const output = await deps.executeOperation(
              (step as any).operation,
              args,
            );
            return withOutput(state, step.id, output);
          },
        });

      case 'agent':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: any) => {
            const state = inputData as WorkflowState;
            const prompt = resolveValue((step as any).prompt, mkScope(state));
            const raw = await deps.runJudgment({
              agentBindingId: definition.bindings[(step as any).agentRef].id,
              prompt: String(prompt),
              outputSpec: (step as any).outputSchema,
            });
            // The declared output schema is a contract, not a hint — judgment
            // either conforms or the step fails (and Mastra's retryConfig may
            // re-attempt it).
            const parsed = buildOutputZod((step as any).outputSchema).safeParse(
              raw,
            );
            if (!parsed.success) {
              throw new Error(
                `agent step "${step.id}" returned output not matching its schema: ` +
                  parsed.error.issues
                    .map((i) => `${i.path.join('.')}: ${i.message}`)
                    .join('; '),
              );
            }
            return withOutput(state, step.id, parsed.data);
          },
        });

      case 'end':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: any) => {
            const state = inputData as WorkflowState;
            const output =
              (step as any).output === undefined
                ? undefined
                : resolveValue((step as any).output, mkScope(state));
            return withOutput(state, step.id, output);
          },
        });

      default:
        // validateDefinition guarantees we never get here.
        throw new Error(`step type "${(step as any).type}" is not compilable`);
    }
  };

  // True when this arm's condition holds AND no earlier arm's does — turning
  // Mastra's run-every-match .branch into the DSL's if/else-if semantics.
  const firstMatchCond =
    (asts: ExprNode[], index: number) =>
    async ({ inputData }: any) => {
      const scope = mkScope(inputData as WorkflowState);
      if (!Boolean(evalExpr(asts[index], scope))) return false;
      for (let j = 0; j < index; j++) {
        if (Boolean(evalExpr(asts[j], scope))) return false;
      }
      return true;
    };

  const buildNested = (id: string, steps: WorkflowStep[]) =>
    buildChain(
      createWorkflow({
        id,
        inputSchema: stateSchema,
        outputSchema: stateSchema,
      }),
      steps,
    ).commit();

  const compileBranch = (chain: any, step: any) => {
    const asts: ExprNode[] = step.branches.map((b: any) => parseExpr(b.when));
    const pairs: any[] = step.branches.map((b: any, i: number) => [
      firstMatchCond(asts, i),
      buildNested(`${key}_${step.id}_b${i}`, b.steps),
    ]);

    // An arm always runs: the declared else, or an identity passthrough — so
    // the post-branch unwrap always finds exactly one state.
    const elseId = `${key}_${step.id}_else`;
    const elseTarget = step.else?.length
      ? buildNested(elseId, step.else)
      : createWorkflow({
          id: elseId,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
        })
          .then(
            createStep({
              id: `${elseId}_noop`,
              inputSchema: stateSchema,
              outputSchema: stateSchema,
              execute: async ({ inputData }: any) => inputData,
            }),
          )
          .commit();
    pairs.push([
      async ({ inputData }: any) => {
        const scope = mkScope(inputData as WorkflowState);
        return asts.every((ast) => !Boolean(evalExpr(ast, scope)));
      },
      elseTarget,
    ]);

    // Branch output is keyed by arm id with exactly one entry defined —
    // unwrap it back into plain state, recording which arm ran.
    return chain.branch(pairs).map(async ({ inputData }: any) => {
      for (const [armId, value] of Object.entries(inputData || {})) {
        if (value && typeof value === 'object' && 'trigger' in (value as any)) {
          const state = value as WorkflowState;
          return withOutput(state, step.id, { taken: armId });
        }
      }
      throw new Error(
        `branch "${step.id}" produced no state — no arm executed`,
      );
    });
  };

  const compileParallel = (chain: any, step: any) => {
    const subs = step.steps.map((s: WorkflowStep) => buildLeafStep(s));
    // Every fan-out member receives the same pre-parallel state; the merge
    // recombines their step outputs (ids are globally unique, so no clashes).
    return chain.parallel(subs).map(async ({ inputData }: any) => {
      const states = Object.values(inputData || {}) as WorkflowState[];
      if (!states.length)
        throw new Error(`parallel "${step.id}" produced no results`);
      const merged: WorkflowState = {
        trigger: states[0].trigger,
        steps: Object.assign({}, ...states.map((s) => s?.steps || {})),
      };
      return withOutput(merged, step.id, {
        completed: step.steps.map((s: any) => s.id),
      });
    });
  };

  const buildChain = (start: any, steps: WorkflowStep[]) => {
    let chain = start;
    for (const step of steps) {
      if (step.type === 'wait') {
        // Workflow-level sleep: the run parks in Mastra (status `waiting`,
        // snapshot persisted) instead of holding a process timer.
        chain = chain.sleep((step as any).duration);
        continue;
      }
      if (step.type === 'branch') {
        chain = compileBranch(chain, step);
        continue;
      }
      if (step.type === 'parallel') {
        chain = compileParallel(chain, step);
        continue;
      }
      chain = chain.then(buildLeafStep(step));
    }
    return chain;
  };

  return buildChain(
    createWorkflow({
      id: key,
      inputSchema: stateSchema,
      outputSchema: stateSchema,
    }),
    definition.steps,
  ).commit();
}

/**
 * Extracts the run's final output: the last top-level step's recorded output
 * (for an `end` step, its declared output; for a branch, `{ taken }`; etc.).
 */
export function finalOutput(
  definition: WorkflowDefinition,
  state: { steps?: Record<string, { output: any }> } | undefined,
): any {
  if (!state?.steps) return undefined;
  const steps = definition.steps;
  const last = steps[steps.length - 1];
  return state.steps[last.id]?.output;
}
