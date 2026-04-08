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
    public static readonly getPages = async (query: any) => {
      const pages = await models.Pages.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static readonly createPage = async (doc: ICMSPage) => {
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

    public static readonly updatePage = async (_id: string, doc: ICMSPage) => {
      const existing = await models.Pages.findOne({ _id });

      if (!existing) {
        throw new Error('Page not found');
      }

      if (doc.name && doc.name !== existing.name) {
        if (doc.slug) {
          doc.slug = await generateUniqueSlug(
            models.Pages,
            doc.clientPortalId,
            'slug',
            doc.slug,
          );
        } else {
          const baseSlug = slugify(doc.name, { lower: true });
          doc.slug = await generateUniqueSlug(
            models.Pages,
            doc.clientPortalId,
            'slug',
            baseSlug,
          );
        }
      } else {
        doc.slug = existing.slug;
      }

      return models.Pages.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
    };

    public static readonly deletePage = async (_id: string) => {
      const page = await models.Pages.findOneAndDelete({ _id: _id });
      return page;
    };
  }
  cmsPageSchema.loadClass(Pages);

  return cmsPageSchema;
};
