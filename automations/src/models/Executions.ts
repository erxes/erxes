import { Document, Model, model, Schema } from 'mongoose';

export interface IExecution {
  automationId: string;
  triggerType: string;
  triggerData: any;
  targetId: string;
  status: string;
  lastCheckedWaitDate: Date;
  waitingActionId: string;
}

export interface IExecutionDocument extends IExecution, Document {
  _id: string;
}

export const executionSchema = new Schema({
  automationId: { type: String, required: true },
  triggerType: { type: String, required: true },
  triggerData: { type: Object },
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