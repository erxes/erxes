import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface IPage {
  siteId: string;
  name: string;
  description: string;
  html: string;
  css: string;
  templateId: string;

  createdBy: string;
  modifiedBy: string;
}

export interface IPageDocument extends IPage, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
}

export const pageSchema = new Schema({
  siteId: field({ type: String, optional: true, label: 'Site' }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  html: field({ type: String, optional: true, label: 'Html' }),
  css: field({ type: String, optional: true, label: 'Css' }),
  templateId: field({ type: String, optional: true, label: 'Template' }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});

export interface IPageModel extends Model<IPageDocument> {
  checkDuplication(name: string): void;
  createPage(doc: IPage, userId: string): Promise<IPageDocument>;
  updatePage(_id: string, doc: IPage, userId: string): Promise<IPageDocument>;
  removePage(_id: string): Promise<IPageDocument>;
}

export const loadPageClass = (models: IModels) => {
  class Page {
    public static async checkDuplication(
      name: string,
      siteId: string,
      id?: string
    ) {
      const query: { [key: string]: any } = {
        name,
        siteId
      };

      if (id) {
        query._id = { $ne: id };
      }

      const page = await models.Pages.findOne(query);

      if (page) {
        throw new Error('Duplicated! Please change name or site.');
      }
    }

    public static async createPage(doc: IPage, userId: string) {
      await this.checkDuplication(doc.name, doc.siteId);

      return models.Pages.create({
        ...doc,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    public static async updatePage(_id: string, doc: IPage, userId: string) {
      await this.checkDuplication(doc.name, doc.siteId, _id);

      await models.Pages.updateOne(
        { _id },
        { $set: { ...doc, modifiedBy: userId, modifiedAt: new Date() } }
      );

      return models.Pages.findOne({ _id });
    }

    public static async removePage(_id) {
      return models.Pages.deleteOne({ _id });
    }
  }

  pageSchema.loadClass(Page);

  return pageSchema;
};
