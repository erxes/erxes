import { Document, Model, model, Schema } from 'mongoose';

export interface IExecAction {
  createdAt?: Date;
  actionId: string;
  actionType: string;
  actionConfig?: any;
  nextActionId?: string;
  result?: any;
}

export interface IExecution {
  createdAt?: Date;
  modifiedAt?: Date;
  automationId: string;
  triggerId: string;
  triggerType: string;
  triggerConfig: any;
  nextActionId?: string;
  targetId: string;
  target: any;
  status: string;
  description: string;
  actions?: IExecAction[];
  startWaitingDate?: Date;
  waitingActionId?: string;
}

export interface IExecutionDocument extends IExecution, Document {
  _id: string;
}

export const EXECUTION_STATUS = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  ERROR: 'error',
  MISSID: 'missed',
  COMPLETE: 'complete',
  ALL: ['active', 'waiting', 'error', 'missed', 'complete']
}

const execActionSchema = new Schema({
  createdAt: { type: Date, default: Date.now(), required: true },
  actionId: { type: String },
  actionType: { type: String },
  actionConfig: { type: Object },
  nextActionId: { type: String },
  result: { type: Object }
})

export const executionSchema = new Schema({
  createdAt: { type: Date, default: Date.now(), required: true },
  modifiedAt: { type: Date, default: Date.now(), required: true },
  automationId: { type: String, required: true, index: true },
  triggerId: { type: String, required: true, index: true },
  triggerType: { type: String },
  triggerConfig: { type: Object },
  nextActionId: { type: String },
  targetId: { type: String, required: true, index: true },
  target: { type: Object },
  status: {
    type: String,
    enum: EXECUTION_STATUS.ALL,
    default: EXECUTION_STATUS.ACTIVE,
    label: 'Status',
    index: true
  },
  description: { type: String, required: true },
  actions: { type: [execActionSchema] },
  startWaitingDate: { type: Date },
  waitingActionId: { type: String },
});

export interface IExecutionModel extends Model<IExecutionDocument> {
  createExecution(doc: IExecution): IExecutionDocument;
  getExecution(selector: any): IExecutionDocument;
  removeExecutions(automationIds: string[]): void;
}

export const loadClass = () => {
  class Execution {
    public static async createExecution(doc) {
      return Executions.create({ createdAt: new Date(), ...doc });
    }

    public static async getExecution(selector) {
      return Executions.findOne(selector);
    }

    public static async removeExecutions(automationIds) {
      return Executions.deleteMany({ automationId: { $in: automationIds } });
    }

  }

  executionSchema.loadClass(Execution);

  return executionSchema;
};

loadClass();

// tslint:disable-next-line
export const Executions = model<IExecutionDocument, IExecutionModel>('automations_executions', executionSchema);