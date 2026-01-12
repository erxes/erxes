import { Model } from 'mongoose';

import { ICMSPage, ICMSPageDocument } from '@/cms/@types/cms';
import { IModels } from '~/connectionResolvers';
import slugify from 'slugify';
import { cmsPageSchema } from '@/cms/db/definitions/cms';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface ICMSPageModel extends Model<ICMSPageDocument> {
  getPages: (query: any) => Promise<ICMSPageDocument[]>;
  createPage: (doc: ICMSPage) => Promise<ICMSPageDocument>;
  updatePage: (_id: string, doc: ICMSPage) => Promise<ICMSPageDocument>;
  deletePage: (_id: string) => Promise<ICMSPageDocument>;
}

export const loadPageClass = (models: IModels) => {
  class Pages {
    public static getPages = async (query: any) => {
      const pages = await models.Pages.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static createPage = async (doc: ICMSPage) => {
      if (doc.name) {
        const baseSlug = doc.slug || slugify(doc.name, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.Pages,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      const existingPage = await models.Pages.findOne({
        slug: doc.slug,
        clientPortalId: doc.clientPortalId,
      });

      if (existingPage) {
        throw new Error('Page already exists');
      }

      return models.Pages.create(doc);
    };

    public static updatePage = async (_id: string, doc: ICMSPage) => {
      if (doc.name) {
        const baseSlug = doc.slug || slugify(doc.name, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.Pages,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
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
        { new: true },
      );
      return page;
    };

    public static deletePage = async (_id: string) => {
      const page = await models.Pages.findOneAndDelete({ _id: _id });
      return page;
    };
  }
  cmsPageSchema.loadClass(Pages);

  return cmsPageSchema;
};
