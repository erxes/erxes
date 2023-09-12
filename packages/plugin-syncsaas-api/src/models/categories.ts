import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ICategory,
  ICategoryDocument,
  syncSaasCategories
} from './definitions/sync';

export interface ICategoriesModel extends Model<ICategoryDocument> {
  addCategory(doc: any): Promise<ICategoryDocument>;
  editCategory(_id: string, doc: any): Promise<ICategoryDocument>;
  removeCategory(_id: string): Promise<ICategoryDocument>;
}

const validateDoc = async (models: IModels, doc: ICategory) => {
  if (await models.Categories.findOne({ name: doc.name })) {
    throw new Error('Category already exists');
  }

  if (!doc.code) {
    throw new Error('please provide a code');
  }
};

export const loadSyncCategoriesClass = (models: IModels, subdomain: string) => {
  class Categories {
    public static async addCategory(doc: ICategory) {
      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const parentCategory = await models.Categories.findOne({
        _id: doc.parentId
      }).lean();

      return await models.Categories.create({
        ...doc,
        order: parentCategory
          ? `${parentCategory.order}/${doc.code}`
          : `${doc.code}`
      });
    }

    public static async editCategory(
      _id: string,
      doc: { _id: string } & ICategory
    ) {
      const category = await models.Categories.findOne({ _id: doc._id });

      if (!category) {
        throw new Error('Category not found');
      }

      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const parent = await models.Categories.findOne({ _id: doc.parentId });

      doc.order = parent ? `${parent.order}${doc.code}/` : `${doc.code}/`;

      const children = await models.Categories.find({
        order: { $regex: new RegExp(category.order, 'i') }
      });

      for (const child of children) {
        let order = child.order;

        await models.Categories.updateOne(
          {
            _id: child._id
          },
          {
            $set: { order: order.replace(category.order, doc.order) }
          }
        );
      }

      return await models.Categories.updateOne(
        { _id: doc._id },
        { $set: { ...doc } }
      );
    }
    public static async removeCategory(_id: string) {
      const category = await models.Categories.findOne({ _id });

      if (!category) {
        throw new Error('Category not found');
      }

      return await models.Categories.deleteMany({
        order: { $regex: new RegExp(category.order, 'i') }
      });
    }
  }

  syncSaasCategories.loadClass(Categories);

  return syncSaasCategories;
};
