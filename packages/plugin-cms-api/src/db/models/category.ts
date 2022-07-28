import { Document, Schema, Model, Connection, Types, model } from 'mongoose';
import { IModels } from './index';

export interface ICategory {
  _id: any;
  name: string;
  parentId?: string | null;
}

export type CategoryDocument = ICategory & Document;
export interface ICategoryModel extends Model<CategoryDocument> {
  getDescendantsOf(_id: string): Promise<ICategory[] | null | undefined>;
  getAncestorsOf(_id: string): Promise<ICategory[] | null | undefined>;
}

export const categorySchema = new Schema<CategoryDocument>({
  // _id: { type: String, pkey: true },
  name: { type: String, required: true },
  parentId: { type: Types.ObjectId }
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CategoryModel {
    public static async getDescendantsOf(
      _id: string
    ): Promise<ICategory[] | undefined | null> {
      const matchedCategories = await models.Category.aggregate([
        {
          $match: {
            _id
          }
        },
        {
          $graphLookup: {
            from: models.Category.collection.collectionName,
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'descendants'
          }
        }
      ]);

      console.log('-----------------------------------------');
      console.log(matchedCategories);
      console.log('-----------------------------------------');

      if (!matchedCategories?.length) {
        throw new Error(`Category with _id=${_id} doesn't exist`);
      }

      // it should contain only 1 root category, since we $match-ed using its _id
      return matchedCategories[0].descendants;
    }

    public static async getAncestorsOf(
      _id: string
    ): Promise<ICategory[] | undefined | null> {
      const results = await models.Category.aggregate([
        {
          $match: {
            _id
          }
        },
        {
          $graphLookup: {
            from: models.Category.collection.collectionName,
            startWith: '$parentId',
            connectFromField: 'parentId',
            connectToField: '_id',
            as: 'ancestors'
          }
        }
      ]);

      if (!results?.length) {
        throw new Error(`Category with _id=${_id} doesn't exist`);
      }

      // it should contain only 1 root category, since we $match-ed using its _id
      return results[0].ancestors;
    }
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<CategoryDocument, ICategoryModel>(
    'cms_categories',
    categorySchema
  );
};
