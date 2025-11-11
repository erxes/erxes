import { Model } from 'mongoose';

import {
  IMenuItem,
  IMenuItemDocument,
  menuItemSchema,
} from './definitions/menu';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';
import { generateUniqueSlug, generateUniqueSlugWithExclusion } from './utils';

export interface IMenuItemModel extends Model<IMenuItemDocument> {
  getMenuItems: (query: any) => Promise<IMenuItemDocument[]>;
  createMenuItem: (doc: IMenuItem) => Promise<IMenuItemDocument>;
  updateMenuItem: (_id: string, doc: IMenuItem) => Promise<IMenuItemDocument>;
  deleteMenuItem: (_id: string) => Promise<IMenuItemDocument>;
}

export const loadMenuItemClass = (models: IModels) => {
  class MenuItems {
    public static getMenuItems = async (query: any) => {
      const pages = await models.MenuItems.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static createMenuItem = async (doc: IMenuItem) => {
      if (!doc.url && doc.label) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlug(models.MenuItems, 'url', baseSlug);
      }

      if (!doc.order) {
        // find max order
        const lastMenuItem = await models.MenuItems.findOne({
          clientPortalId: doc.clientPortalId,
        }).sort({ order: -1 }).lean();
  
        if (lastMenuItem) {
          doc.order = lastMenuItem.order + 1;
        } else {
          doc.order = 1;
        }
      }

      return models.MenuItems.create(doc);
    };

    public static updateMenuItem = async (_id: string, doc: IMenuItem) => {
      const existingMenuItem = await models.MenuItems.findOne({ _id });
      if (!doc.url && doc.label && existingMenuItem?.url) {
        const baseSlug = slugify(doc.label, { lower: true });
        doc.url = await generateUniqueSlugWithExclusion(models.MenuItems, 'url', baseSlug, _id);
      }

      const menu = await models.MenuItems.(
        { _id: _id },
        { $set: doc },
        { new: true }
      );
      return menu;
    };

    public static deleteMenuItem = async (_id: string) => {
      const page = await models.MenuItems.findOneAndDelete({ _id: _id });
      return page;
    };
  }
  menuItemSchema.loadClass(MenuItems);

  return menuItemSchema;
};
