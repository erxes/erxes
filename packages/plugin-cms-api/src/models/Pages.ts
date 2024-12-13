import { Model } from 'mongoose';

import { IPage, IPageDocument, pageSchema } from './definitions/pages';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';

export interface IPageModel extends Model<IPageDocument> {
  getPages: (query: any) => Promise<IPageDocument[]>;
  createPage: (doc: IPage) => Promise<IPageDocument>;
  updatePage: (_id: string, doc: IPage) => Promise<IPageDocument>;
  deletePage: (_id: string) => Promise<IPageDocument>;
}

export const loadPageClass = (models: IModels) => {
  class Pages {
    public static getPages = async (query: any) => {
      const pages = await models.Pages.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static createPage = async (doc: IPage) => {
      if (!doc.slug && doc.name) {
        doc.slug = slugify(doc.name, { lower: true });
      }

      const existingPage = await models.Pages.findOne({ slug: doc.slug, clientPortalId: doc.clientPortalId });

      if (existingPage) {
        throw new Error('Page already exists');
      }

      return models.Pages.create(doc);
    };

    public static updatePage = async (_id: string, doc: IPage) => {
      if (!doc.slug && doc.name) {
        doc.slug = slugify(doc.name, { lower: true });
      }

      const existingPage = await models.Pages.countDocuments({
        slug: doc.slug,
        clientPortalId: doc.clientPortalId,
        _id: { $ne: _id },
      });

      if (existingPage > 0) {
        throw new Error('Page already exists');
      }

      const page = await models.Pages.findOneAndUpdate(
        { _id: _id },
        { $set: doc },
        { new: true }
      );
      return page;
    };

    public static deletePage = async (_id: string) => {
      const page = await models.Pages.findOneAndDelete({ _id: _id });
      return page;
    };
  }
  pageSchema.loadClass(Pages);

  return pageSchema;
};
