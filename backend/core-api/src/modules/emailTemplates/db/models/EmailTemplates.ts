import { IEmailTemplate, IEmailTemplateDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { emailTemplateSchema } from '@/emailTemplates/db/definitions/emailTemplates';

export interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {
  getEmailTemplate(_id: string): Promise<IEmailTemplateDocument>;
  createEmailTemplate(doc: IEmailTemplate): Promise<IEmailTemplateDocument>;
  updateEmailTemplate(
    _id: string,
    doc: Partial<IEmailTemplate>,
  ): Promise<IEmailTemplateDocument | null>;
  removeEmailTemplate(_id: string): Promise<{ deletedCount?: number }>;
}

export const loadEmailTemplateClass = (models: IModels) => {
  class EmailTemplate {
    public static async getEmailTemplate(_id: string) {
      const template = await models.EmailTemplates.findOne({ _id });

      if (!template) {
        throw new Error('Email template not found');
      }

      return template;
    }

    public static async createEmailTemplate(doc: IEmailTemplate) {
      return models.EmailTemplates.create({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    public static async updateEmailTemplate(
      _id: string,
      doc: Partial<IEmailTemplate>,
    ) {
      await models.EmailTemplates.getEmailTemplate(_id);

      await models.EmailTemplates.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      return models.EmailTemplates.findOne({ _id });
    }

    public static async removeEmailTemplate(_id: string) {
      await models.EmailTemplates.getEmailTemplate(_id);

      return models.EmailTemplates.deleteOne({ _id });
    }
  }

  emailTemplateSchema.loadClass(EmailTemplate);

  return emailTemplateSchema;
};
