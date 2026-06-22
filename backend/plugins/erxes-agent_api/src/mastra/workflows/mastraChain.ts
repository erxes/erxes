import type { WorkflowState } from './compiler';

/**
 * The single place the Mastra workflow-builder API is pulled in through an
 * untyped CJS require(). Mastra's real types are unreachable from this CJS
 * module, so the cast lives HERE and nowhere else — the rest of the compiler
 * imports thinly-typed wrappers and stays cast-free.
 *
 * Lazy CJS require, NOT dynamic import(): under tsx, import() of a Mastra
 * subpath inside a CJS module resolves to the ESM build through the loader
 * hooks and deadlocks (never settles). require() deterministically picks the
 * .cjs build — the path the rest of this plugin already runs on.
 */

/**
 * The subset of Mastra's fluent workflow-builder API the compiler drives.
 * `commit()` returns `unknown` — the committed workflow's real shape
 * (CompiledWorkflow) is the compiler's contract, applied at the boundary.
 */
export interface WorkflowChain {
  then(step: unknown): WorkflowChain;
  sleep(ms: number): WorkflowChain;
  branch(pairs: Array<[unknown, unknown]>): WorkflowChain;
  parallel(steps: unknown[]): WorkflowChain;
  map(
    fn: (args: {
      inputData: Record<string, unknown>;
    }) => Promise<WorkflowState>,
  ): WorkflowChain;
  commit(): unknown;
}

interface MastraStepConfig {
  id: string;
  inputSchema: unknown;
  outputSchema: unknown;
  execute: (args: { inputData: any }) => unknown;
}

interface MastraWorkflowConfig {
  id: string;
  inputSchema: unknown;
  outputSchema: unknown;
}

interface MastraWorkflowsModule {
  createWorkflow(config: MastraWorkflowConfig): WorkflowChain;
  createStep(config: MastraStepConfig): unknown;
}

function loadMastraWorkflows(): MastraWorkflowsModule {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@mastra/core/workflows') as MastraWorkflowsModule; // skipcq: JS-0359
}

/** Creates a Mastra workflow chain (the lie is confined to loadMastraWorkflows). */
export function createWorkflow(config: MastraWorkflowConfig): WorkflowChain {
  return loadMastraWorkflows().createWorkflow(config);
}

/** Creates a Mastra step; execute takes inputData typed by the caller. */
export function createStep(config: MastraStepConfig): unknown {
  return loadMastraWorkflows().createStep(config);
}
