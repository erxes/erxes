import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels, models } from '../connectionResolver';
import {
  ITemplate,
  ITemplateDocument,
  templateSchema
} from './definitions/template';

export interface ITemplateModel extends Model<ITemplateDocument> {
  createTemplate(doc: ITemplate): Promise<ITemplateDocument>;
}

export const loadTemplateClass = (models: IModels) => {
  class Template {
    // create
    public static async createTemplate(doc: ITemplate) {
      return models.Templates.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
