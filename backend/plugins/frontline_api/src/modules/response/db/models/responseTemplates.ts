import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { responseTemplateSchema } from '@/response/db/definitions/responseTemplates';
import {
  IResponseTemplate,
  IResponseTemplateDocument,
} from '@/response/@types/responseTemplates';

export interface IResponseTemplateModel
  extends Model<IResponseTemplateDocument> {
  getResponseTemplate(_id: string): Promise<IResponseTemplateDocument>;
  updateResponseTemplate(
    _id: string,
    fields: IResponseTemplate,
  ): Promise<IResponseTemplateDocument>;
  removeResponseTemplate(_id: string): void;
}

export const loadClass = (models: IModels) => {
  class ResponseTemplate {
    public static async getResponseTemplate(_id: string) {
      const responseTemplate = await models.ResponseTemplates.findOne({ _id });

      if (!responseTemplate) {
        throw new Error('Response template not found');
      }

      return responseTemplate;
    }

    public static async updateResponseTemplate(
      _id: string,
      fields: IResponseTemplate,
    ) {
      await models.ResponseTemplates.updateOne(
        { _id },
        { $set: { ...fields } },
      );

      return models.ResponseTemplates.findOne({ _id });
    }

    public static async removeResponseTemplate(_id: string) {
      const responseTemplateObj =
        await models.ResponseTemplates.findOneAndDelete({ _id });

      if (!responseTemplateObj) {
        throw new Error(`Response template not found with id ${_id}`);
      }

      return responseTemplateObj;
    }
  }

  responseTemplateSchema.loadClass(ResponseTemplate);

  return responseTemplateSchema;
};
