import { Model } from 'mongoose';

import { IMenuItem, IMenuItemDocument } from '@/portal/@types/menu';
import { IModels } from '~/connectionResolvers';
import { menuItemSchema } from '@/portal/db/definitions/menu';
import slugify from 'slugify';

export interface IMenuItemModel extends Model<IMenuItemDocument> {
  getMenuItems: (query: any) => Promise<IMenuItemDocument[]>;
  createMenuItem: (doc: IMenuItem) => Promise<IMenuItemDocument>;
  updateMenuItem: (_id: string, doc: IMenuItem) => Promise<IMenuItemDocument>;
  deleteMenuItem: (_id: string) => any;
}

export const loadMenuItemClass = (models: IModels) => {
  class MenuItems {
    public static getMenuItems = async (query: any) => {
      const pages = await models.MenuItems.find(query).sort({ name: 1 }).lean();

      return pages;
    };

    public static createMenuItem = async (doc: IMenuItem) => {
      if (!doc.url && doc.label) {
        doc.url = slugify(doc.label, { lower: true });
      }

      if (!doc.order) {
        // find max order
        const lastMenuItem = await models.MenuItems.findOne({
          clientPortalId: doc.clientPortalId,
        }).sort({ order: -1 }).lean();
  
        if (lastMenuItem?.order) {
          doc.order = lastMenuItem.order + 1;
        } else {
          doc.order = 1;
        }
      }

      return models.MenuItems.create(doc);
    };

    public static updateMenuItem = async (_id: string, doc: IMenuItem) => {
      if (!doc.url && doc.label) {
        doc.url = slugify(doc.label, { lower: true });
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
  menuItemSchema.loadClass(MenuItems);

  return menuItemSchema;
};
