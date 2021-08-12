import { Document, Model, model, Schema } from 'mongoose';

export interface IActionData {
  actionId: string;
  data: any;
}

export interface IExecution {
  createdAt: Date;
  automationId: string;
  triggerId: string;
  targetId: string;
  target: any;
  actionsData: IActionData[];
  status: string;
  lastCheckedWaitDate: Date;
  waitingActionId: string;
}

export interface IExecutionDocument extends IExecution, Document {
  _id: string;
}

export const actionDataSchema = new Schema({
  actionId: { type: String, required: true },
  data: { type: Object }
}, { _id: false });

export const executionSchema = new Schema({
  createdAt: { type: Date, required: true },
  automationId: { type: String, required: true },
  triggerId: { type: String, required: true },
  targetId: { type: String, required: true },
  target: { type: Object },
  actionsData: { type: [actionDataSchema] },
  lastCheckedWaitDate: { type: Date },
  waitingActionId: { type: String },
});

export interface IExecutionModel extends Model<IExecutionDocument> {
  createExecution(doc: any): IExecutionDocument
}

export const loadClass = () => {
  class Execution {
    public static async createExecution(doc) {
      return Executions.create({ createdAt: new Date(), ...doc });
    }

    public static async getExecution(selector) {
      return Executions.findOne(selector);
    }
  }

  executionSchema.loadClass(Execution);

  return executionSchema;
};

loadClass();

// tslint:disable-next-line
export const Executions = model<IExecutionDocument, IExecutionModel>('automations_executions', executionSchema);