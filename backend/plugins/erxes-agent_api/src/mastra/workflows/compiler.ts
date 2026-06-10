import { z } from 'zod';
import {
  WorkflowDefinition,
  WorkflowStep,
  buildOutputZod,
  validateDefinition,
} from './dsl';
import { resolveValue, RefScope } from './refs';
import type { TriggerEnvelope } from './envelope';

/**
 * Compiles a validated workflow definition (declarative JSON, authored by the
 * master agent) into a real Mastra workflow graph. The definition is DATA; the
 * only executable code is this compiler and the two injected effect handlers —
 * no eval, ever (docs/WORKFLOW-SPEC.md §3).
 *
 * Currently supports the linear kernel subset: operation, agent, wait, end.
 *
 * Execution model: one state object threads through every step —
 *   { trigger: <envelope>, steps: { <id>: { output } } }
 * Each compiled step resolves its `{{ refs }}` against that state, performs its
 * effect through the injected deps, and returns the state extended with its own
 * output. The per-step outputs land in Mastra's snapshot, so suspended runs
 * resume with full context.
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

const mkScope = (
  state: WorkflowState,
  bindings: WorkflowDefinition['bindings'],
): RefScope => ({
  trigger: state.trigger,
  steps: state.steps,
  bindings,
});

const withOutput = (state: WorkflowState, id: string, output: any): WorkflowState => ({
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
    throw new Error(`Cannot compile invalid definition: ${first.path}: ${first.message}`);
  }

  // Lazy CJS require, NOT dynamic import(): under tsx, import() of a Mastra
  // subpath inside a CJS module resolves to the ESM build through the loader
  // hooks and deadlocks (never settles). require() deterministically picks the
  // .cjs build — the path the rest of this plugin already runs on.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createWorkflow, createStep } = require('@mastra/core/workflows');

  const buildStep = (step: WorkflowStep) => {
    switch (step.type) {
      case 'operation':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: any) => {
            const state = inputData as WorkflowState;
            const args = resolveValue(
              (step as any).args || {},
              mkScope(state, definition.bindings),
            );
            const output = await deps.executeOperation((step as any).operation, args);
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
            const prompt = resolveValue(
              (step as any).prompt,
              mkScope(state, definition.bindings),
            );
            const raw = await deps.runJudgment({
              agentBindingId: definition.bindings[(step as any).agentRef].id,
              prompt: String(prompt),
              outputSpec: (step as any).outputSchema,
            });
            // The declared output schema is a contract, not a hint — judgment
            // either conforms or the step fails (and Mastra's retryConfig may
            // re-attempt it).
            const parsed = buildOutputZod((step as any).outputSchema).safeParse(raw);
            if (!parsed.success) {
              throw new Error(
                `agent step "${step.id}" returned output not matching its schema: ` +
                  parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
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
                : resolveValue((step as any).output, mkScope(state, definition.bindings));
            return withOutput(state, step.id, output);
          },
        });

      default:
        // validateDefinition guarantees we never get here.
        throw new Error(`step type "${(step as any).type}" is not compilable`);
    }
  };

  let chain: any = createWorkflow({
    id: key,
    inputSchema: stateSchema,
    outputSchema: stateSchema,
  });

  for (const step of definition.steps) {
    if (step.type === 'wait') {
      // Workflow-level sleep: the run parks in Mastra (status `waiting`,
      // snapshot persisted) instead of holding a process timer.
      chain = chain.sleep((step as any).duration);
      continue;
    }
    chain = chain.then(buildStep(step));
  }

  return chain.commit();
}

/**
 * Extracts the run's final output: the `end` step's declared output when the
 * definition has one, otherwise the last step's output.
 */
export function finalOutput(
  definition: WorkflowDefinition,
  state: WorkflowState | undefined,
): any {
  if (!state?.steps) return undefined;
  const steps = definition.steps;
  const last = steps[steps.length - 1];
  return state.steps[last.id]?.output;
}
