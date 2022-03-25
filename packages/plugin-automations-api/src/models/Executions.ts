import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { executionSchema, IExecution, IExecutionDocument } from './definitions/executions';

export interface IExecutionModel extends Model<IExecutionDocument> {
  createExecution(doc: IExecution): IExecutionDocument;
  getExecution(selector: any): IExecutionDocument;
  removeExecutions(automationIds: string[]): void;
}

export const loadClass = (models: IModels) => {
  class Execution {
    public static async createExecution(doc) {
      return models.Executions.create({ createdAt: new Date(), ...doc });
    }

    public static async getExecution(selector) {
      return models.Executions.findOne(selector);
    }

    public static async removeExecutions(automationIds) {
      return models.Executions.deleteMany({ automationId: { $in: automationIds } });
    }

  }

  executionSchema.loadClass(Execution);

  return executionSchema;
};