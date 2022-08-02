import { Document, Schema, Model, Connection, Types, model } from 'mongoose';
import { IModels } from './index';

export interface ICategory {
  _id: any;
  name: string;
  parentId?: string | null;
  ancestorIds?: string[] | null;
}

export interface ICategoryInsertInput {
  name: string;
  parentId?: string;
}

export interface ICategoryPatchInput {
  name?: string;
  parentId?: string | null;
}

export type CategoryDocument = ICategory & Document;
export interface ICategoryModel extends Model<CategoryDocument> {
  createCategory(c: ICategoryInsertInput): Promise<ICategoryModel>;
  patchCategory(_id: string, c: ICategoryPatchInput): Promise<ICategoryModel>;
  getDescendantsOf(_id: string): Promise<ICategory[] | null | undefined>;
}

/**
 * https://www.mongodb.com/docs/manual/tutorial/model-tree-structures-with-ancestors-array/
 * Array of ancestors pattern
 * This pattern has the best balance between simplicity and speed of descendant/ancestor operations
 *  */
export const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true },
  ancestorIds: { type: [Types.ObjectId], index: true, ref: 'forum_categories' },
  parentId: { type: Types.ObjectId, index: true, ref: 'forum_categories' }
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CategoryModel {
    public static async createCategory(
      input: ICategoryInsertInput
    ): Promise<CategoryDocument> {
      const doc = { ...input } as ICategory;

      if (doc.parentId) {
        const parent = await models.Category.findById(doc.parentId).lean();
        console.log('parent', parent);

        if (!parent) {
          throw new Error(
            `Parent category with \`{ "_id" :  "${doc.parentId}"\` } not found`
          );
        }

        doc.ancestorIds = [...(parent.ancestorIds || []), doc.parentId];
      }

      console.log(JSON.stringify(doc, null, 2));

      const res = await models.Category.create(doc);
      return res;
    }
    public static async patchCategory(
      _id: string,
      input: ICategoryPatchInput
    ): Promise<CategoryDocument> {
      console.log('input', input);

      const patch = { ...input } as ICategory;

      console.log('patch', patch);

      if (patch.parentId !== null) {
        if (patch.parentId !== undefined) {
          const parent = await models.Category.findById(patch.parentId).lean();

          if (!parent) {
            throw new Error(
              `Parent category with \`{ "_id" :  "${patch.parentId}"\` } not found`
            );
          }

          patch.ancestorIds = [...(parent.ancestorIds || []), patch.parentId];
        }
      } else {
        patch.ancestorIds = null;
      }

      // console.log(JSON.stringify(patch, null, 2));

      // throw new Error("Unimplemented");

      const res = await models.Category.updateOne({ _id }, patch);

      const updated = await models.Category.findById(_id);

      if (!updated) {
        throw new Error(`Category with \`{ "_id" : "${_id}"} doesn't exist\``);
      }

      // console.log(JSON.stringify(updated, null, 2));
      return updated;
    }
    public static async getDescendantsOf(
      _id: string
    ): Promise<ICategory[] | undefined | null> {
      const descendants = await models.Category.find({ ancestorIds: _id });
      return descendants;
    }
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<CategoryDocument, ICategoryModel>(
    'forum_categories',
    categorySchema
  );
};
