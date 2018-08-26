import { Model, model } from "mongoose";
import {
  IResponseTemplateDocument,
  responseTemplateSchema
} from "./definitions/responseTemplates";

interface IResponseTemplateInput {
  name?: string;
  content?: string;
  brandId?: string;
  files?: string[];
}

interface IResponseTemplateModel extends Model<IResponseTemplateDocument> {
  updateResponseTemplate(
    _id: string,
    fields: IResponseTemplateInput
  ): Promise<IResponseTemplateDocument>;

  removeResponseTemplate(_id: string): void;
}

class ResponseTemplate {
  /**
   * Update response template
   */
  public static async updateResponseTemplate(_id, fields) {
    await ResponseTemplates.update({ _id }, { $set: { ...fields } });

    return ResponseTemplates.findOne({ _id });
  }

  /**
   * Delete response template
   */
  public static async removeResponseTemplate(_id) {
    const responseTemplateObj = await ResponseTemplates.findOne({ _id });

    if (!responseTemplateObj) {
      throw new Error(`Response template not found with id ${_id}`);
    }

    return responseTemplateObj.remove();
  }
}

responseTemplateSchema.loadClass(ResponseTemplate);

const ResponseTemplates = model<
  IResponseTemplateDocument,
  IResponseTemplateModel
>("response_templates", responseTemplateSchema);

export default ResponseTemplates;
