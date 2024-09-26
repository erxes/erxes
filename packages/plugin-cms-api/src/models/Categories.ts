import { Model } from 'mongoose';

import {
  IPostCategory,
  IPostCategoryDocument,
  postCategorySchema,
} from './definitions/categories';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';

export interface ICategoryModel extends Model<IPostCategoryDocument> {
  getCategories: (query: any) => Promise<IPostCategoryDocument[]>;
}

export const loadCategoryClass = (models: IModels) => {
  class Categories {
    public static getCategories = async (query: any) => {
      const categories = await models.Categories.find(query)
        .sort({ name: 1 })
        .lean();

      return categories;
    };
  }
  postCategorySchema.loadClass(Categories);



  return postCategorySchema;
};
