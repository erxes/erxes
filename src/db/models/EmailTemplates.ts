import { Model, model } from 'mongoose';
import { emailTemplateSchema, IEmailTemplate, IEmailTemplateDocument } from './definitions/emailTemplates';

interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {
  updateEmailTemplate(_id: string, fields: IEmailTemplate): IEmailTemplateDocument;

  removeEmailTemplate(_id: string): void;
}

class EmailTemplate {
  /**
   * Update email template
   */
  public static async updateEmailTemplate(_id: string, fields: IEmailTemplate) {
    await EmailTemplates.update({ _id }, { $set: fields });

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

const EmailTemplates = model<IEmailTemplateDocument, IEmailTemplateModel>('email_templates', emailTemplateSchema);

export default EmailTemplates;
