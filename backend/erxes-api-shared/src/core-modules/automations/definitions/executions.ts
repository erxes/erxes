import { TCreatedVia } from '../../../core-types/common';
import { Document, Schema } from 'mongoose';

export interface IAutomationExecAction {
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  status?:
    | 'success'
    | 'skipped'
    | 'error'
    | 'waiting'
    | 'queued'
    | 'standby'
    | 'dropped';
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
  // Why the action failed, from AUTOMATION_ERROR_CODES. Only set on errors.
  errorCode?: string;
  // Why the action deliberately did nothing. Only set on skipped actions.
  skipReason?: string;
  // Which try this row is. 1 unless an error policy asked for another one.
  attempt?: number;
  // Set on workflow node actions: links to the child execution for drill-in
  childExecutionId?: string;
  // Deferred actions only: matches the completion callback to this attempt so
  // a stale or retried job can never overwrite a newer one.
  jobId?: string;
  // Date in-process, an ISO string once the execution crosses a producer
  // boundary — both shapes reach this type.
  queuedAt?: Date | string;
  // When the sweep gives up on a deferred action that never reported back.
  expiresAt?: Date | string;
}

export interface IAutomationExecution {
  createdAt?: string;
  modifiedAt?: string;
  automationId: string;
  triggerId: string;
  triggerType: string;
  triggerConfig: any;
  /**
   * What set this run going. A caller that addressed the automation on
   * someone's behalf declares its own — a campaign names itself and whoever
   * put it live — and the runner stamps the run's own id onto it. Records the
   * run creates carry it onward.
   */
  createdVia?: TCreatedVia;
  nextActionId?: string;
  targetId: string;
  target: any;
  status: string;
  description: string;
  actions?: IAutomationExecAction[];
  failedActionId?: string;
  failedActionType?: string;
  errorCode?: string;
  // Actions that failed while the run itself carried on: a deferred 'ignore'
  // action reporting late, or a failure taken by an error branch. The run is
  // complete, so without this the failure would vanish with it.
  handledFailureActionIds?: string[];
  startWaitingDate?: Date;
  waitingActionId?: string;
  objToCheck?: any;
  responseActionId?: string;
  // Workflow child executions: run a workflow's member actions on behalf of
  // a parent execution that waits on the workflow node.
  parentExecutionId?: string;
  workflowId?: string;
  // Input values frozen when the workflow was entered; members resolve
  // {{ input.* }} from here.
  inputs?: Record<string, any>;
  depth?: number;
}

export interface IAutomationExecutionDocument
  extends IAutomationExecution,
    Document {
  _id: string;
}

export const AUTOMATION_EXECUTION_STATUS = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  // Paused on a deferred action the flow still needs the result of.
  STANDBY: 'standby',
  ERROR: 'error',
  MISSID: 'missed',
  COMPLETE: 'complete',
  ALL: ['active', 'waiting', 'standby', 'error', 'missed', 'complete'],
};

const execActionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, required: true },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  durationMs: { type: Number },
  status: {
    type: String,
    enum: [
      'success',
      'skipped',
      'error',
      'waiting',
      'queued',
      'standby',
      'dropped',
    ],
  },
  actionId: { type: String },
  actionType: { type: String },
  actionConfig: { type: Object },
  nextActionId: { type: String },
  result: { type: Object },
  childExecutionId: { type: String },
  errorCode: { type: String },
  skipReason: { type: String },
  attempt: { type: Number },
  jobId: { type: String },
  queuedAt: { type: Date },
  expiresAt: { type: Date },
});

export const automationExecutionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, required: true },
  modifiedAt: { type: Date, default: Date.now, required: true },
  automationId: { type: String, required: true },
  triggerId: { type: String, required: true },
  triggerType: { type: String },
  triggerConfig: { type: Object },
  createdVia: { type: Object },
  nextActionId: { type: String },
  targetId: { type: String, required: true, index: true },
  target: { type: Object },
  status: {
    type: String,
    enum: AUTOMATION_EXECUTION_STATUS.ALL,
    default: AUTOMATION_EXECUTION_STATUS.ACTIVE,
    label: 'Status',
    index: true,
  },
  description: { type: String, required: true },
  actions: { type: [execActionSchema] },
  failedActionId: { type: String },
  failedActionType: { type: String },
  errorCode: { type: String },
  handledFailureActionIds: { type: [String] },
  startWaitingDate: { type: Date },
  waitingActionId: { type: String },
  responseActionId: { type: String },
  objToCheck: { type: Object, optional: true },
  parentExecutionId: { type: String, index: true },
  workflowId: { type: String },
  inputs: { type: Object },
  depth: { type: Number, default: 0 },
});

// Executions are write-heavy, so only the compound indexes the real queries
// need. The `automationId` / `triggerId` prefixes cover single-field lookups.

// History list and stats: match by automation, order/range by createdAt.
automationExecutionSchema.index({ automationId: 1, createdAt: -1 });

// Status-filtered list and the status breakdown.
automationExecutionSchema.index({ automationId: 1, status: 1, createdAt: -1 });

// Engine hot path: latest execution of a target for re-enrollment checks.
automationExecutionSchema.index({
  automationId: 1,
  triggerId: 1,
  targetId: 1,
  createdAt: -1,
});

automationExecutionSchema.index(
  { automationId: 1, failedActionId: 1, createdAt: -1 },
  { sparse: true },
);
automationExecutionSchema.index(
  { automationId: 1, errorCode: 1, createdAt: -1 },
  { sparse: true },
);
