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
  createCategory: (data: IPostCategory) => Promise<IPostCategoryDocument>;
  updateCategory: (
    id: string,
    data: IPostCategory
  ) => Promise<IPostCategoryDocument>;
  deleteCategory: (id: string) => Promise<IPostCategoryDocument>;
  toggleStatus: (id: string) => Promise<IPostCategoryDocument>;
}

export const loadCategoryClass = (models: IModels) => {
  class Categories {
    public static createCategory = async (data: IPostCategory) => {
      const slug = data.slug || slugify(data.name, { lower: true });
      data.slug = slug;
      const category = await models.Categories.create(data);
      return category;
    };

    public static updateCategory = async (id: string, data: IPostCategory) => {
      if (!data.slug && data.name) {
        data.slug = slugify(data.name, { lower: true });
      }

      const category = await models.Categories.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      );
      return category;
    };

    public static deleteCategory = async (id: string) => {
      const category = await models.Categories.findOneAndDelete({ _id: id });
      return category;
    };


    public static getCategories = async (query: any) => {
      const categories = await models.Categories.find(query)
        .sort({ name: 1 })
        .lean();

      return categories;
    };

    public static toggleStatus = async (id: string) => {
      const category = await models.Categories.findOne({ _id: id }).lean();
      if (!category) {
        throw new Error('Category not found');
      }

      category.status = category.status === 'active' ? 'inactive' : 'active';
      const updatedCategory = await models.Categories.findOneAndUpdate(
        { _id: id },
        { $set: category },
        { new: true }
      );
      return updatedCategory;
    };
  }
  postCategorySchema.loadClass(Categories);

  return postCategorySchema;
};
