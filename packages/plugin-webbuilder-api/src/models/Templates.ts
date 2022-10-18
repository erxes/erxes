import { IModels } from '../connectionResolver';
import { Model } from 'mongoose';
import {
  ITemplate,
  ITemplateDocument,
  templateSchema
} from './definitions/templates';

export interface ITemplateModel extends Model<ITemplateDocument> {
  createTemplate(doc: ITemplate): Promise<ITemplateDocument>;
}

export const loadTemplateClass = (models: IModels) => {
  class Template {
    public static async createTemplate(doc: ITemplate) {
      return models.Templates.create({
        ...doc
      });
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
