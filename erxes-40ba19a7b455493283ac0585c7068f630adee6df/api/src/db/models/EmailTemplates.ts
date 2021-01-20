import { Model, model } from 'mongoose';
import {
  emailTemplateSchema,
  IEmailTemplate,
  IEmailTemplateDocument
} from './definitions/emailTemplates';

export interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {
  getEmailTemplate(_id: string): IEmailTemplateDocument;
  updateEmailTemplate(
    _id: string,
    fields: IEmailTemplate
  ): IEmailTemplateDocument;
  removeEmailTemplate(_id: string): void;
}

export const loadClass = () => {
  class EmailTemplate {
    /**
     * Get email template
     */
    public static async getEmailTemplate(_id: string) {
      const emailTemplate = await EmailTemplates.findOne({ _id });

      if (!emailTemplate) {
        throw new Error('Email template not found');
      }

      return emailTemplate;
    }

    /**
     * Updates an email template
     */
    public static async updateEmailTemplate(
      _id: string,
      fields: IEmailTemplate
    ) {
      await EmailTemplates.updateOne({ _id }, { $set: fields });

      return EmailTemplates.findOne({ _id });
    }

    /**
     * Delete email template
     */
    public static async removeEmailTemplate(_id: string) {
      const emailTemplateObj = await EmailTemplates.findOne({ _id });

      if (!emailTemplateObj) {
        throw new Error(`Email template not found with id ${_id}`);
      }

      return emailTemplateObj.remove();
    }
  }

  emailTemplateSchema.loadClass(EmailTemplate);

  return emailTemplateSchema;
};

loadClass();

// tslint:disable-next-line
const EmailTemplates = model<IEmailTemplateDocument, IEmailTemplateModel>(
  'email_templates',
  emailTemplateSchema
);

export default EmailTemplates;
