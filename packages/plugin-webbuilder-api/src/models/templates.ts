import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ITemplate {
  name: string;
  jsonData: any;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
}

export const templateSchema = new Schema({
  name: { type: String, label: 'Name' },
  jsonData: { type: Object }
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
