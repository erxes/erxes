import { Model } from 'mongoose';

import {
  IPage,
  IPageDocument,
  pageSchema,
} from './definitions/pages';
import { IModels } from '../connectionResolver';

export interface IPageModel extends Model<IPageDocument> {
  getPages: (query: any) => Promise<IPageDocument[]>;
}

export const loadPageClass = (models: IModels) => {
  class Pages {
    public static getPages = async (query: any) => {
      const pages = await models.Pages.find(query)
        .sort({ name: 1 })
        .lean();

      return pages;
    };
  }
  pageSchema.loadClass(Pages);

  return pageSchema;
};
