import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

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

class Page {
  public static async createPage(doc) {
    return Pages.create(doc);
  }

  public static async updatePage(_id: string, doc) {
    await Pages.updateOne({ _id }, { $set: doc });

    return Pages.findOne({ _id });
  }

  public static async remotePage(_id) {
    return Pages.deleteOne({ _id });
  }
}

pageSchema.loadClass(Page);

const Pages = model<IPageDocument, IPageModel>('webbuilder_pages', pageSchema);

export { Pages };
