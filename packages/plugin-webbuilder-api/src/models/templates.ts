import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface ITemplate {
  name: string;
  jsonData: any;
  html: string;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
}

export const templateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  jsonData: field({ type: Object, label: 'Json data' }),
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
