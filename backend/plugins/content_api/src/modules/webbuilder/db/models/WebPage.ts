import { Model } from 'mongoose';
import slugify from 'slugify';

import { generateUniqueSlug } from '@/cms/utils/common';
import { IWebPage, IWebPageDocument } from '@/webbuilder/@types/webPage';
import { webPageSchema } from '@/webbuilder/db/definitions/webPage';
import { IModels } from '~/connectionResolvers';

export interface IWebPageModel extends Model<IWebPageDocument> {
  getPages: (query: any) => Promise<IWebPageDocument[]>;
  createPage: (doc: IWebPage) => Promise<IWebPageDocument>;
  updatePage: (_id: string, doc: IWebPage) => Promise<IWebPageDocument>;
  deletePage: (_id: string) => Promise<IWebPageDocument>;
}

export function loadWebPageClass(models: IModels) {
  class WebPages {
    public static getPages = async (query: any) => {
      const pages = await models.WebPages.find(query).sort({ name: 1 }).lean();
      return pages;
    };

    public static createPage = async (doc: IWebPage) => {
      if (doc.name) {
        const baseSlug = doc.slug || slugify(doc.name, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.WebPages,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      const existingPage = await models.WebPages.findOne({
        slug: doc.slug,
        clientPortalId: doc.clientPortalId,
      });

      if (existingPage) {
        throw new Error('Page already exists');
      }

      return models.WebPages.create(doc);
    };

    public static updatePage = async (_id: string, doc: IWebPage) => {
      if (doc.name) {
        const baseSlug = doc.slug || slugify(doc.name, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.WebPages,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      const existingPage = await models.WebPages.countDocuments({
        slug: doc.slug,
        clientPortalId: doc.clientPortalId,
        _id: { $ne: _id },
      });

      if (existingPage > 0) {
        throw new Error('Page already exists');
      }

      const page = await models.WebPages.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );

      return page;
    };

    public static deletePage = async (_id: string) => {
      const page = await models.WebPages.findOneAndDelete({ _id });
      return page;
    };
  }

  webPageSchema.loadClass(WebPages);

  return webPageSchema;
}

