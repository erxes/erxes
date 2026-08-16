import {
  AUTOMATION_STATUSES,
  automationSchema,
  IAutomationDocument,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  buildDuplicatedAutomation,
  generateDuplicateName,
} from './utils/duplicateAutomation';

export interface IAutomationModel extends Model<IAutomationDocument> {
  getAutomation(_id: string): Promise<IAutomationDocument>;
  duplicateAutomation(
    _id: string,
    userId: string,
    name?: string,
  ): Promise<IAutomationDocument>;
}

export const loadClass = (models: IModels) => {
  class Automation {
    public static async getAutomation(_id) {
      return await models.Automations.findOne({ _id }).lean();
    }

    public static async duplicateAutomation(
      _id: string,
      userId: string,
      name?: string,
    ) {
      const automation = await models.Automations.getAutomation(_id);

      if (!automation) {
        throw new Error('Automation not found');
      }

      const duplicated = await buildDuplicatedAutomation(models, automation);
      const now = new Date();

      return models.Automations.create({
        ...duplicated,
        name:
          name?.trim() ||
          (await generateDuplicateName(models, automation.name)),
        status: AUTOMATION_STATUSES.DRAFT,
        duplicatedFrom: _id,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        updatedBy: userId,
      });
    }
  }

  automationSchema.loadClass(Automation);

  return automationSchema;
};
