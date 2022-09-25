import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface ITemplate {
  name: string;
  html: string;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
}

export const templateSchema = new Schema({
  name: field({ type: String, label: 'Name' }),
  html: field({ type: String, label: 'Html' })
});

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
