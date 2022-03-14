import { Model, model } from 'mongoose';
import { executionSchema, IExecution, IExecutionDocument } from './definitions/executions';

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
