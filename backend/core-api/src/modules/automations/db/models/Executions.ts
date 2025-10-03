import { Model } from 'mongoose';
import {
  automationExecutionSchema,
  IAutomationExecution,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export interface IExecutionModel extends Model<IAutomationExecutionDocument> {
  createExecution(doc: IAutomationExecution): IAutomationExecutionDocument;
  getExecution(selector: any): IAutomationExecutionDocument;
  removeExecutions(automationIds: string[]): Promise<void>;
}

export const loadClass = (models: IModels) => {
  class Execution {
    public static async createExecution(doc) {
      return models.AutomationExecutions.create({
        createdAt: new Date(),
        ...doc,
      });
    }

    public static async getExecution(selector) {
      return models.AutomationExecutions.findOne(selector);
    }

    public static async removeExecutions(automationIds) {
      return models.AutomationExecutions.deleteMany({
        automationId: { $in: automationIds },
      });
    }
  }

  automationExecutionSchema.loadClass(Execution);

  return automationExecutionSchema;
};
