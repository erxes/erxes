import { z } from 'zod';
import { ExpectedError } from 'erxes-api-shared/utils';
import {
  WorkflowDefinition,
  WorkflowStep,
  branchStepSchema,
  buildOutputZod,
  parallelStepSchema,
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
  executeOperation(
    operation: string,
    args: Record<string, unknown>,
  ): Promise<unknown>;
  /**
   * Runs one judgment (LLM) call on the bound agent and returns the raw
   * object the model produced. Schema validation happens here in the
   * compiled step, against the definition's declared outputSchema.
   */
  runJudgment(params: {
    agentBindingId: string;
    prompt: string;
    outputSpec: Record<string, string>;
  }): Promise<Record<string, unknown>>;
}

export interface WorkflowState {
  trigger: TriggerEnvelope;
  steps: Record<string, { output: unknown }>;
}

/** Result shape of a finished (or failed) run of a compiled workflow. */
export interface CompiledRunResult {
  status: string;
  result?: WorkflowState;
  error?: { message?: string };
  steps: Record<string, { status?: string; error?: { message?: string } }>;
}

/** Handle for one run of a compiled workflow. */
export interface CompiledRunHandle {
  runId: string;
  start(args: { inputData: WorkflowState }): Promise<CompiledRunResult>;
}

/**
 * The committed workflow graph. ⚠️ It is a thenable (Mastra's step-chaining
 * `.then`) — NEVER await it; see the compileDefinition warning below.
 */
export interface CompiledWorkflow {
  createRun(): Promise<CompiledRunHandle>;
  createRunAsync(): Promise<CompiledRunHandle>;
}

/** The subset of Mastra's fluent workflow-builder API the compiler drives. */
interface WorkflowChain {
  then(step: unknown): WorkflowChain;
  sleep(ms: number): WorkflowChain;
  branch(pairs: Array<[unknown, unknown]>): WorkflowChain;
  parallel(steps: unknown[]): WorkflowChain;
  map(
    fn: (args: {
      inputData: Record<string, unknown>;
    }) => Promise<WorkflowState>,
  ): WorkflowChain;
  commit(): CompiledWorkflow;
}

type BranchStep = z.infer<typeof branchStepSchema>;
type ParallelStep = z.infer<typeof parallelStepSchema>;

const stateSchema = z.object({
  trigger: z.any(),
  steps: z.record(z.any()),
});

/** Returns the state extended with one step's recorded output. */
const withOutput = (
  state: WorkflowState,
  id: string,
  output: unknown,
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
): CompiledWorkflow {
  const check = validateDefinition(definition);
  if (!check.ok) {
    const first = check.errors[0];
    throw new ExpectedError(
      `Cannot compile invalid definition: ${first.path}: ${first.message}`,
    );
  }

  // Lazy CJS require, NOT dynamic import(): under tsx, import() of a Mastra
  // subpath inside a CJS module resolves to the ESM build through the loader
  // hooks and deadlocks (never settles). require() deterministically picks the
  // .cjs build — the path the rest of this plugin already runs on.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createWorkflow, createStep } = require('@mastra/core/workflows'); // skipcq: JS-0359

  /** Bridges run state into the ref-resolution scope (plus static bindings). */
  const mkScope = (state: WorkflowState): RefScope => ({
    trigger: state.trigger,
    steps: state.steps,
    bindings: definition.bindings,
  });

  /** Compiles one effect step (operation / agent / end) into a Mastra step. */
  const buildLeafStep = (step: WorkflowStep): unknown => {
    switch (step.type) {
      case 'operation':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: { inputData: WorkflowState }) => {
            const state = inputData;
            const args = resolveValue(
              step.args || {},
              mkScope(state),
            ) as Record<string, unknown>;
            const output = await deps.executeOperation(step.operation, args);
            return withOutput(state, step.id, output);
          },
        });

      case 'agent':
        return createStep({
          id: step.id,
          inputSchema: stateSchema,
          outputSchema: stateSchema,
          execute: async ({ inputData }: { inputData: WorkflowState }) => {
            const state = inputData;
            const prompt = resolveValue(step.prompt, mkScope(state));
            const raw = await deps.runJudgment({
              agentBindingId: definition.bindings[step.agentRef].id,
              prompt: String(prompt),
              outputSpec: step.outputSchema,
            });
            // The declared output schema is a contract, not a hint — judgment
            // either conforms or the step fails (and Mastra's retryConfig may
            // re-attempt it).
            const parsed = buildOutputZod(step.outputSchema).safeParse(raw);
            if (!parsed.success) {
              throw new ExpectedError(
                `agent step "${
                  step.id
                }" returned output not matching its schema: ${parsed.error.issues
                  .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                  .join('; ')}`,
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
          execute: ({ inputData }: { inputData: WorkflowState }) => {
            const state = inputData;
            const output =
              step.output === undefined
                ? undefined
                : resolveValue(step.output, mkScope(state));
            return Promise.resolve(withOutput(state, step.id, output));
          },
        });

      default:
        // validateDefinition guarantees we never get here.
        throw new Error(`step type "${step.type}" is not compilable`);
    }
  };

  /**
   * True when this arm's condition holds AND no earlier arm's does — turning
   * Mastra's run-every-match .branch into the DSL's if/else-if semantics.
   */
  const firstMatchCond =
    (asts: ExprNode[], index: number) =>
    ({ inputData }: { inputData: WorkflowState }) => {
      const scope = mkScope(inputData);
      if (!evalExpr(asts[index], scope)) return false;
      for (let j = 0; j < index; j++) {
        if (evalExpr(asts[j], scope)) return false;
      }
      return true;
    };

  /** Compiles a step list into a committed nested workflow over plain state. */
  const buildNested = (id: string, steps: WorkflowStep[]): CompiledWorkflow =>
    buildChain(
      createWorkflow({
        id,
        inputSchema: stateSchema,
        outputSchema: stateSchema,
      }),
      steps,
    ).commit();

  /** Compiles a branch step: first-match arms, an always-runs else, an unwrap. */
  const compileBranch = (chain: WorkflowChain, step: BranchStep) => {
    const asts: ExprNode[] = step.branches.map((arm) => parseExpr(arm.when));
    const pairs: Array<[unknown, unknown]> = step.branches.map(
      (arm, i): [unknown, unknown] => [
        firstMatchCond(asts, i),
        buildNested(`${key}_${step.id}_b${i}`, arm.steps),
      ],
    );

    // An arm always runs: the declared else, or an identity passthrough — so
    // the post-branch unwrap always finds exactly one state.
    const elseId = `${key}_${step.id}_else`;
    const elseTarget = step.else?.length
      ? buildNested(elseId, step.else)
      : (
          createWorkflow({
            id: elseId,
            inputSchema: stateSchema,
            outputSchema: stateSchema,
          }) as WorkflowChain
        )
          .then(
            createStep({
              id: `${elseId}_noop`,
              inputSchema: stateSchema,
              outputSchema: stateSchema,
              execute: ({ inputData }: { inputData: WorkflowState }) =>
                Promise.resolve(inputData),
            }),
          )
          .commit();
    pairs.push([
      ({ inputData }: { inputData: WorkflowState }) => {
        const scope = mkScope(inputData);
        return asts.every((ast) => !evalExpr(ast, scope));
      },
      elseTarget,
    ]);

    // Branch output is keyed by arm id with exactly one entry defined —
    // unwrap it back into plain state, recording which arm ran.
    return chain.branch(pairs).map(({ inputData }) => {
      for (const [armId, value] of Object.entries(inputData || {})) {
        if (value && typeof value === 'object' && 'trigger' in value) {
          const state = value as WorkflowState;
          return Promise.resolve(withOutput(state, step.id, { taken: armId }));
        }
      }
      throw new Error(
        `branch "${step.id}" produced no state — no arm executed`,
      );
    });
  };

  /** Compiles a parallel step: same-input fan-out plus a state-merging map. */
  const compileParallel = (chain: WorkflowChain, step: ParallelStep) => {
    const subs = step.steps.map((member) => buildLeafStep(member));
    // Every fan-out member receives the same pre-parallel state; the merge
    // recombines their step outputs (ids are globally unique, so no clashes).
    return chain.parallel(subs).map(({ inputData }) => {
      const states = Object.values(inputData || {}) as WorkflowState[];
      if (!states.length)
        throw new Error(`parallel "${step.id}" produced no results`);
      const merged: WorkflowState = {
        trigger: states[0].trigger,
        steps: Object.assign({}, ...states.map((state) => state?.steps || {})),
      };
      return Promise.resolve(
        withOutput(merged, step.id, {
          completed: step.steps.map((member) => member.id),
        }),
      );
    });
  };

  /** Threads every top-level step onto the Mastra chain, container-aware. */
  function buildChain(start: WorkflowChain, steps: WorkflowStep[]) {
    let chain = start;
    for (const step of steps) {
      if (step.type === 'wait') {
        // Workflow-level sleep: the run parks in Mastra (status `waiting`,
        // snapshot persisted) instead of holding a process timer.
        chain = chain.sleep(step.duration);
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
  }

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
  state: { steps?: Record<string, { output: unknown }> } | undefined,
): unknown {
  if (!state?.steps) return undefined;
  const steps = definition.steps;
  const last = steps[steps.length - 1];
  return state.steps[last.id]?.output;
}
