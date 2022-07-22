import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IPage {
  name: string;
  description: string;
  html: string;
  css: string;
  jsonData: any;
}

export interface IPageDocument extends IPage, Document {
  _id: string;
}

export const pageSchema = new Schema({
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  html: { type: String },
  css: { type: String },
  jsonData: { type: Object }
});

export interface IPageModel extends Model<IPageDocument> {
  createPage(doc: IPage): Promise<IPageDocument>;
  updatePage(_id: string, doc: IPage): Promise<IPageDocument>;
  removePage(_id: string): Promise<IPageDocument>;
}

export const loadPageClass = (models: IModels) => {
  class Page {
    public static async createPage(doc) {
      return models.Pages.create(doc);
    }

    public static async updatePage(_id: string, doc) {
      await models.Pages.updateOne({ _id }, { $set: doc });

      return models.Pages.findOne({ _id });
    }

    public static async remotePage(_id) {
      return models.Pages.deleteOne({ _id });
    }
  }

  pageSchema.loadClass(Page);

  return pageSchema;
};
