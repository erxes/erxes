import { Document, Schema } from 'mongoose';

export interface IAutomationExecAction {
  createdAt?: string;
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
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
  startWaitingDate?: Date;
  waitingActionId?: string;
  objToCheck?: any;
  responseActionId?: string;
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
  actionId: { type: String },
  actionType: { type: String },
  actionConfig: { type: Object },
  nextActionId: { type: String },
  result: { type: Object },
});

export const automationExecutionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, required: true },
  modifiedAt: { type: Date, default: Date.now, required: true },
  automationId: { type: String, required: true, index: true },
  triggerId: { type: String, required: true, index: true },
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
  startWaitingDate: { type: Date },
  waitingActionId: { type: String },
  responseActionId: { type: String },
  objToCheck: { type: Object, optional: true },
});
