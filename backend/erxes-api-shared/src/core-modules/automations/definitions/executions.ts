import { Document, Schema } from 'mongoose';

export interface IAutomationExecAction {
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  status?: 'success' | 'error' | 'waiting';
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
  // Why the action failed, from AUTOMATION_ERROR_CODES. Only set on errors.
  errorCode?: string;
  // Set on workflow node actions: links to the child execution for drill-in
  childExecutionId?: string;
}

export interface IAutomationExecution {
  createdAt?: string;
  modifiedAt?: string;
  automationId: string;
  triggerId: string;
  triggerType: string;
  triggerConfig: any;
  nextActionId?: string;
  targetId: string;
  target: any;
  status: string;
  description: string;
  actions?: IAutomationExecAction[];
  failedActionId?: string;
  failedActionType?: string;
  errorCode?: string;
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
  ERROR: 'error',
  MISSID: 'missed',
  COMPLETE: 'complete',
  ALL: ['active', 'waiting', 'error', 'missed', 'complete'],
};

const execActionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, required: true },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  durationMs: { type: Number },
  status: { type: String, enum: ['success', 'error', 'waiting'] },
  actionId: { type: String },
  actionType: { type: String },
  actionConfig: { type: Object },
  nextActionId: { type: String },
  result: { type: Object },
  childExecutionId: { type: String },
  errorCode: { type: String },
});

export const automationExecutionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, required: true },
  modifiedAt: { type: Date, default: Date.now, required: true },
  automationId: { type: String, required: true },
  triggerId: { type: String, required: true },
  triggerType: { type: String },
  triggerConfig: { type: Object },
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
