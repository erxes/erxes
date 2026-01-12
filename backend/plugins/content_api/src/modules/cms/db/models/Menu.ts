import { Model } from 'mongoose';

import { ICMSMenu, ICMSMenuDocument } from '@/cms/@types/cms';
import { IModels } from '~/connectionResolvers';
import { cmsMenuSchema } from '@/cms/db/definitions/cms';
import slugify from 'slugify';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface ICMSMenuItemModel extends Model<ICMSMenuDocument> {
  getMenuItems: (query: any) => Promise<ICMSMenuDocument[]>;
  createMenuItem: (doc: ICMSMenu) => Promise<ICMSMenuDocument>;
  updateMenuItem: (_id: string, doc: ICMSMenu) => Promise<ICMSMenuDocument>;
  deleteMenuItem: (_id: string) => any;
}

export const loadMenuItemClass = (models: IModels) => {
  class MenuItems {
    public static getMenuItems = async (query: any) => {
      const pages = await models.MenuItems.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static createMenuItem = async (doc: ICMSMenu) => {
      if (!doc.url && doc.label) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlug(
          models.MenuItems,
          doc.clientPortalId,
          'url',
          baseSlug,
        );
      }

      if (!doc.order) {
        // find max order
        const lastMenuItem = await models.MenuItems.findOne({
          clientPortalId: doc.clientPortalId,
        })
          .sort({ order: -1 })
          .lean();

        if (lastMenuItem) {
          doc.order = lastMenuItem.order || 0 + 1;
        } else {
          doc.order = 1;
        }
      }

      return models.MenuItems.create(doc);
    };

    public static updateMenuItem = async (_id: string, doc: ICMSMenu) => {
      const existingMenuItem = await models.MenuItems.findOne({ _id });
      if (!doc.url && doc.label && existingMenuItem?.url) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlug(
          models.MenuItems,
          doc.clientPortalId,
          'url',
          baseSlug,
        );
      }

      const menu = await models.MenuItems.findOneAndUpdate(
        { _id: _id },
        { $set: doc },
        { new: true },
      );
      return menu;
    };

    public static deleteMenuItem = async (_id: string) => {
      const page = await models.MenuItems.findOneAndDelete({ _id: _id });
      return page;
    };
  }
  cmsMenuSchema.loadClass(MenuItems);

  return cmsMenuSchema;
};
