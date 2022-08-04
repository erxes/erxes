import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { Transform } from 'stream';
import { IModels } from './index';

export interface ICategory {
  _id: any;
  name: string;
  code?: string | null;
  thumbnail?: string | null;
  parentId?: string | null;
}

export type InputCategoryInsert = Omit<ICategory, '_id'>;
export type InputCategoryPatch = Partial<Omit<ICategory, '_id'>>;

export type CategoryDocument = ICategory & Document;
export interface ICategoryModel extends Model<CategoryDocument> {
  createCategory(input: InputCategoryInsert): Promise<CategoryDocument>;
  patchCategory(
    _id: string,
    input: InputCategoryPatch
  ): Promise<CategoryDocument>;
  deleteCategory(
    _id: string,
    tranfserChildrenToCategory?: string
  ): Promise<void>;
  getDescendantsOf(_id: string): Promise<ICategory[] | undefined | null>;
  getAncestorsOf(_id: string): Promise<ICategory[] | undefined | null>;
}

/**
 * https://www.mongodb.com/docs/manual/tutorial/model-tree-structures-with-ancestors-array/
 * Array of ancestors pattern
 * This pattern has the best balance between simplicity and speed of descendant/ancestor operations
 *  */
export const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true },
  code: { type: String, index: true, unique: true, sparse: true },
  thumbnail: String,
  parentId: { type: Types.ObjectId, index: true }
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CategoryModel {
    public static async createCategory(
      input: InputCategoryInsert
    ): Promise<CategoryDocument> {
      return await models.Category.create(input);
    }
    public static async patchCategory(
      _id: string,
      input: InputCategoryPatch
    ): Promise<CategoryDocument> {
      const patch = { ...input } as Partial<Omit<ICategory, '_id'>>;

      await models.Category.updateOne({ _id }, patch);

      const updated = await models.Category.findById(_id);

      if (!updated) {
        throw new Error(`Category with \`{ "_id" : "${_id}"} doesn't exist\``);
      }

      return updated;
    }

    public static async deleteCategory(
      _id: string,
      tranfserDescendantsToCategory?: string
    ): Promise<void> {
      const childrenCount = await models.Category.countDocuments({
        parentId: _id
      });

      if (childrenCount > 0 && !tranfserDescendantsToCategory) {
        throw new Error(
          `Cannot delete a category that has existing subcategories without specifying a different category to transfer its existing subcategories`
        );
      }

      const postsCount = await models.Post.countDocuments({ categoryId: _id });

      if (postsCount > 0 && !tranfserDescendantsToCategory) {
        throw new Error(
          `Cannot delete a category that has existing posts without specifying a different category to transfer its existing posts`
        );
      }

      const session = await con.startSession();
      session.startTransaction();
      try {
        await models.Post.updateMany(
          { categoryId: _id },
          { categoryId: tranfserDescendantsToCategory }
        );
        await models.Category.updateMany(
          { parentId: _id },
          { parentId: tranfserDescendantsToCategory }
        );
        await models.Category.deleteOne({ _id });
      } catch (e) {
        await session.abortTransaction();
        throw e;
      }
      await session.commitTransaction();
    }

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

      // it should contain only 1 category, since we $match-ed using its _id
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

      // it should contain only 1 category, since we $match-ed using its _id
      return results[0].ancestors;
    }
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<CategoryDocument, ICategoryModel>(
    'forum_categories',
    categorySchema
  );
};
