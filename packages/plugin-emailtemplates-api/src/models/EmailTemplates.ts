import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  emailTemplateSchema,
  IEmailTemplate,
  IEmailTemplateDocument
} from './definitions/emailTemplates';

export interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {
  getEmailTemplate(_id: string): IEmailTemplateDocument;
  createEmailTemplate(doc: IEmailTemplate, user?: any): IEmailTemplateDocument;
  updateEmailTemplate(
    _id: string,
    fields: IEmailTemplate
  ): IEmailTemplateDocument;
  removeEmailTemplate(_id: string): void;
}

export const loadEmailTemplateClass = (models: IModels) => {
  class EmailTemplate {
    /**
     * Get email template
     */
    public static async getEmailTemplate(_id: string) {
      const emailTemplate = await models.EmailTemplates.findOne({ _id });

      if (!emailTemplate) {
        throw new Error('Email template not found');
      }

      return emailTemplate;
    }

    /**
     * create an email template
     */
    public static async createEmailTemplate(doc: IEmailTemplate, user?: any) {
      const template = await models.EmailTemplates.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        createdBy: user._id
      });

      return models.EmailTemplates.getEmailTemplate(template._id);
    }

    /**
     * Updates an email template
     */
    public static async updateEmailTemplate(
      _id: string,
      fields: IEmailTemplate
    ) {
      await models.EmailTemplates.updateOne(
        { _id },
        { $set: { ...fields, modifiedAt: new Date() } }
      );

      return models.EmailTemplates.findOne({ _id });
    }

    /**
     * Delete email template
     */
    public static async removeEmailTemplate(_id: string) {
      const emailTemplateObj = await models.EmailTemplates.findOne({ _id });

      if (!emailTemplateObj) {
        throw new Error(`Email template not found with id ${_id}`);
      }

      return emailTemplateObj.remove();
    }
  }

  emailTemplateSchema.loadClass(EmailTemplate);

  return emailTemplateSchema;
};
