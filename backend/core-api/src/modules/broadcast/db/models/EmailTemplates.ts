import { broadcastEmailTemplateSchema } from '@/broadcast/db/definitions/emailTemplates';
import { Model } from 'mongoose';
import {
  IBroadcastEmailTemplate,
  IBroadcastEmailTemplateDocument,
} from '@/broadcast/@types';
import { IModels } from '~/connectionResolvers';

export interface IBroadcastEmailTemplateModel
  extends Model<IBroadcastEmailTemplateDocument> {
  getEmailTemplate(_id: string): Promise<IBroadcastEmailTemplateDocument>;
  createEmailTemplate(
    doc: IBroadcastEmailTemplate,
  ): Promise<IBroadcastEmailTemplateDocument>;
  updateEmailTemplate(
    _id: string,
    doc: Partial<IBroadcastEmailTemplate>,
  ): Promise<IBroadcastEmailTemplateDocument>;
  removeEmailTemplates(_ids: string[]): Promise<unknown>;
}

export const loadBroadcastEmailTemplateClass = (models: IModels) => {
  class BroadcastEmailTemplate {
    public static async getEmailTemplate(_id: string) {
      const template = await models.BroadcastEmailTemplates.findOne({ _id });

      if (!template) {
        throw new Error('Email template not found');
      }

      return template;
    }

    public static createEmailTemplate(doc: IBroadcastEmailTemplate) {
      return models.BroadcastEmailTemplates.create({ ...doc });
    }

    public static async updateEmailTemplate(
      _id: string,
      doc: Partial<IBroadcastEmailTemplate>,
    ) {
      await models.BroadcastEmailTemplates.updateOne({ _id }, { $set: doc });

      return models.BroadcastEmailTemplates.findOne({ _id });
    }

    public static removeEmailTemplates(_ids: string[]) {
      return models.BroadcastEmailTemplates.deleteMany({
        _id: { $in: _ids },
      });
    }
  }

  broadcastEmailTemplateSchema.loadClass(BroadcastEmailTemplate);

  return broadcastEmailTemplateSchema;
};
