import { Model } from 'mongoose';
import slugify from 'slugify';

import { IWebMenuItem, IWebMenuItemDocument } from '@/webbuilder/@types/webMenu';
import { IModels } from '~/connectionResolvers';
import { webMenuSchema } from '@/webbuilder/db/definitions/webMenu';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface IWebMenuItemModel extends Model<IWebMenuItemDocument> {
  getMenuItems: (query: any) => Promise<IWebMenuItemDocument[]>;
  createMenuItem: (doc: IWebMenuItem) => Promise<IWebMenuItemDocument>;
  updateMenuItem: (
    _id: string,
    doc: IWebMenuItem,
  ) => Promise<IWebMenuItemDocument>;
  deleteMenuItem: (_id: string) => Promise<IWebMenuItemDocument | null>;
}

export const loadWebMenuItemClass = (models: IModels) => {
  class WebMenuItems {
    public static getMenuItems = async (query: any) => {
      const items = await models.WebMenuItems.find(query).sort({ name: 1 }).lean();

      return items;
    };

    public static createMenuItem = async (doc: IWebMenuItem) => {
      if (!doc.url && doc.label) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlug(
          models.WebMenuItems,
          doc.clientPortalId,
          'url',
          baseSlug,
        );
      }

      if (!doc.order) {
        const lastMenuItem = await models.WebMenuItems.findOne({
          clientPortalId: doc.clientPortalId,
        })
          .sort({ order: -1 })
          .lean();

        if (lastMenuItem && lastMenuItem.order) {
          doc.order = lastMenuItem.order + 1;
        } else {
          doc.order = 1;
        }
      }

      return models.WebMenuItems.create(doc);
    };

    public static updateMenuItem = async (_id: string, doc: IWebMenuItem) => {
      const existingMenuItem = await models.WebMenuItems.findOne({ _id });

      if (!doc.url && doc.label && existingMenuItem?.url) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlug(
          models.WebMenuItems,
          doc.clientPortalId,
          'url',
          baseSlug,
        );
      }

      const menu = await models.WebMenuItems.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );

      return menu;
    };

    public static deleteMenuItem = async (_id: string) => {
      const menu = await models.WebMenuItems.findOneAndDelete({ _id });
      return menu;
    };
  }

  webMenuSchema.loadClass(WebMenuItems);

  return webMenuSchema;
};

