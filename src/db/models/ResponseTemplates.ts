import { Model, model } from 'mongoose';
import { IResponseTemplate, IResponseTemplateDocument, responseTemplateSchema } from './definitions/responseTemplates';

interface IResponseTemplateModel extends Model<IResponseTemplateDocument> {
  updateResponseTemplate(_id: string, fields: IResponseTemplate): Promise<IResponseTemplateDocument>;

  removeResponseTemplate(_id: string): void;
}

class ResponseTemplate {
  /**
   * Update response template
   */
  public static async updateResponseTemplate(_id: string, fields: IResponseTemplate) {
    await ResponseTemplates.update({ _id }, { $set: { ...fields } });

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

const ResponseTemplates = model<IResponseTemplateDocument, IResponseTemplateModel>(
  'response_templates',
  responseTemplateSchema,
);

export default ResponseTemplates;
