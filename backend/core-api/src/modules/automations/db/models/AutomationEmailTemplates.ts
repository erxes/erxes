import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { automationEmailTemplateSchema } from '@/automations/db/definitions/automationEmailTemplate';
import {
  IAutomationEmailTemplate,
  IAutomationEmailTemplateDocument,
} from 'erxes-api-shared/core-types';

export interface IAutomationEmailTemplateModel
  extends Model<IAutomationEmailTemplateDocument> {
  getEmailTemplate(_id: string): Promise<IAutomationEmailTemplateDocument>;
  createEmailTemplate(
    doc: IAutomationEmailTemplate,
  ): Promise<IAutomationEmailTemplateDocument>;
  updateEmailTemplate(
    _id: string,
    doc: Partial<IAutomationEmailTemplate>,
  ): Promise<IAutomationEmailTemplateDocument>;
  removeEmailTemplate(_id: string): Promise<any>;
}

export const loadAutomationEmailTemplateClass = (models: IModels) => {
  class AutomationEmailTemplate {
    public static async getEmailTemplate(_id: string) {
      const template = await models.AutomationEmailTemplates.findOne({ _id });

      if (!template) {
        throw new Error('Email template not found');
      }

      return template;
    }

    public static async createEmailTemplate(doc: IAutomationEmailTemplate) {
      const template = await models.AutomationEmailTemplates.create({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return template;
    }

    public static async updateEmailTemplate(
      _id: string,
      doc: Partial<IAutomationEmailTemplate>,
    ) {
      const template = await models.AutomationEmailTemplates.getEmailTemplate(
        _id,
      );

      await models.AutomationEmailTemplates.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            updatedAt: new Date(),
          },
        },
      );

      return models.AutomationEmailTemplates.findOne({ _id: template._id });
    }

    public static async removeEmailTemplate(_id: string) {
      const template = await models.AutomationEmailTemplates.getEmailTemplate(
        _id,
      );

      if (!template) {
        throw new Error('Email template not found');
      }

      return models.AutomationEmailTemplates.deleteOne({ _id });
    }
  }

  automationEmailTemplateSchema.loadClass(AutomationEmailTemplate);

  return automationEmailTemplateSchema;
};
