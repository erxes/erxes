// Hand-written response interfaces for the workflow GraphQL documents — this
// repo has no codegen, so the call sites type useQuery/useMutation manually.

/** A node in the workflow DSL. The shape is intentionally open: definitions are
 *  authored as free-form JSON, so we only constrain the keys this UI reads. */
export interface IWorkflowStep {
  id?: string;
  type?: string;
  [key: string]: unknown;
}

/** A workflow trigger declaration as stored on the definition. */
export interface IWorkflowTrigger {
  type?: string;
  config?: { cron?: string; [key: string]: unknown };
  [key: string]: unknown;
}

/** The workflow DSL document (free-form JSON authored by agents or by hand). */
export interface IWorkflowDefinition {
  trigger?: IWorkflowTrigger;
  steps?: IWorkflowStep[];
  [key: string]: unknown;
}

export interface IWorkflow {
  _id: string;
  name: string;
  description?: string;
  definition: IWorkflowDefinition;
  version: number;
  isEnabled: boolean;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkflowsQueryResponse {
  mastraWorkflows: IWorkflow[];
}

export interface IWorkflowQueryResponse {
  mastraWorkflow: IWorkflow | null;
}

/** Per-step rollup attached to a run, keyed by step id. */
export interface IWorkflowRunStepSummary {
  status?: string;
  error?: string;
  [key: string]: unknown;
}

export interface IWorkflowRun {
  _id: string;
  workflowId: string;
  version: number;
  runId: string;
  status: string;
  triggerEnvelope?: { source?: string; [key: string]: unknown };
  stepsSummary?: Record<string, IWorkflowRunStepSummary>;
  output?: unknown;
  error?: string;
  usage?: { llmCalls?: number; [key: string]: unknown };
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface IWorkflowRunsQueryResponse {
  mastraWorkflowRuns: IWorkflowRun[];
}

/** Result of the server-side definition validation mutation. */
export interface IWorkflowValidation {
  ok: boolean;
  errors?: { path?: string; message: string }[];
}

export interface IWorkflowValidateResponse {
  mastraWorkflowValidate: IWorkflowValidation | null;
}

export interface IWorkflowCreateResponse {
  mastraWorkflowCreate: { _id: string } | null;
}
