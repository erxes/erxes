import { Model, model } from 'mongoose';
import {
  IResponseTemplate,
  IResponseTemplateDocument,
  responseTemplateSchema
} from './definitions/responseTemplates';

export interface IResponseTemplateModel
  extends Model<IResponseTemplateDocument> {
  getResponseTemplate(_id: string): Promise<IResponseTemplateDocument>;
  updateResponseTemplate(
    _id: string,
    fields: IResponseTemplate
  ): Promise<IResponseTemplateDocument>;
  removeResponseTemplate(_id: string): void;
}

export const loadClass = () => {
  class ResponseTemplate {
    /*
     * Get a Pipeline template
     */
    public static async getResponseTemplate(_id: string) {
      const responseTemplate = await ResponseTemplates.findOne({ _id });

      if (!responseTemplate) {
        throw new Error('Response template not found');
      }

      return responseTemplate;
    }
    /**
     * Update response template
     */
    public static async updateResponseTemplate(
      _id: string,
      fields: IResponseTemplate
    ) {
      await ResponseTemplates.updateOne({ _id }, { $set: { ...fields } });

      return ResponseTemplates.findOne({ _id });
    }

    /**
     * Delete response template
     */
    public static async removeResponseTemplate(_id: string) {
      const responseTemplateObj = await ResponseTemplates.findOne({ _id });

      if (!responseTemplateObj) {
        throw new Error(`Response template not found with id ${_id}`);
      }

      return responseTemplateObj.remove();
    }
  }

  responseTemplateSchema.loadClass(ResponseTemplate);

  return responseTemplateSchema;
};

loadClass();

// tslint:disable-next-line
const ResponseTemplates = model<
  IResponseTemplateDocument,
  IResponseTemplateModel
>('response_templates', responseTemplateSchema);

export default ResponseTemplates;