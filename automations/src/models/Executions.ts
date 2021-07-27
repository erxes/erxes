import { Document, Model, model, Schema } from 'mongoose';

export interface IActionData {
  actionId: string;
  data: any;
}

export interface IExecution {
  automationId: string;
  triggerId: string;
  triggerData: any;
  actionsData: IActionData[];
  targetId: string;
  status: string;
  lastCheckedWaitDate: Date;
  waitingActionId: string;
}

export interface IExecutionDocument extends IExecution, Document {
  _id: string;
}

export const actionDataSchema = new Schema({
  id: { type: String, required: true },
  actionId: { type: String, required: true },
  data: { type: Object }
}, { _id: false });

export const executionSchema = new Schema({
  automationId: { type: String, required: true },
  triggerId: { type: String, required: true },
  triggerData: { type: Object },
  actionsData: { type: [actionDataSchema] },
  targetId: { type: String, required: true },
  lastCheckedWaitDate: { type: Date },
  waitingActionId: { type: String },
});

export interface IExecutionModel extends Model<IExecutionDocument> {
}

export const loadClass = () => {
  class Execution {
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