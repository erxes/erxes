import { Document } from 'mongoose';
import type { WorkflowDefinition } from '~/mastra/workflows/dsl';
import type { TriggerEnvelope } from '~/mastra/workflows/envelope';

export interface IMastraWorkflow {
  name: string;
  description?: string;
  // The declarative DSL document: { trigger, policy, bindings, limits, steps }.
  // Validated by validateDefinition before every save.
  definition: WorkflowDefinition;
  version?: number;
  isEnabled?: boolean;
  createdByUserId?: string;
}

export interface IMastraWorkflowDocument extends IMastraWorkflow, Document {
  _id: string;
  version: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowRunStatus =
  | 'running'
  | 'suspended'
  | 'success'
  | 'failed'
  | 'canceled';

export interface IMastraWorkflowRun {
  workflowId: string;
  // The definition version this run is pinned to — runs never migrate to
  // edited definitions (docs/WORKFLOW-SPEC.md §11.3).
  version: number;
  runId: string;
  status: WorkflowRunStatus;
  triggerEnvelope: TriggerEnvelope;
  definitionSnapshot: WorkflowDefinition;
  stepsSummary?: Record<string, { status: string; error?: string }>;
  output?: unknown;
  error?: string;
  usage?: { llmCalls: number };
  startedAt?: Date;
  finishedAt?: Date;
}

export interface IMastraWorkflowRunDocument
  extends IMastraWorkflowRun,
    Document {
  _id: string;
}
