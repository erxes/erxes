import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { ITemplate, ITemplateDocument, templateSchema } from './definitions/template';

export interface ITemplateModel extends Model<ITemplateDocument> {
  createTemplate(doc: ITemplate): Promise<ITemplateDocument>;
}

export const loadTemplateClass = (models: IModels) => {
  class Template {
    public static async createTemplate(doc: ITemplate) {
      return models.Templates.create({
        name: "Template"
      })
    }

  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
