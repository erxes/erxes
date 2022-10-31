import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';
import {
  ReadCpUserLevels,
  READ_CP_USER_LEVELS,
  WriteCpUserLevels,
  WRITE_CP_USER_LEVELS
} from '../../consts';

export interface ICategory {
  _id: any;
  name: string;
  code?: string | null;
  thumbnail?: string | null;
  parentId?: string | null;

  userLevelReqPostRead: ReadCpUserLevels;
  userLevelReqPostWrite: WriteCpUserLevels;

  // userLevelReqCommentRead: ReadCpUserLevels;
  userLevelReqCommentWrite: WriteCpUserLevels;

  postsReqCrmApproval: boolean;
}

export type InputCategoryInsert = Omit<ICategory, '_id'>;
export type InputCategoryPatch = Partial<InputCategoryInsert>;

export type CategoryDocument = ICategory & Document;
export interface ICategoryModel extends Model<CategoryDocument> {
  findByIdOrThrow(_id: string): Promise<CategoryDocument>;
  createCategory(input: InputCategoryInsert): Promise<CategoryDocument>;
  patchCategory(
    _id: string,
    input: InputCategoryPatch
  ): Promise<CategoryDocument>;
  deleteCategory(_id: string): Promise<CategoryDocument>;
  getDescendantsOf(_id: string[]): Promise<ICategory[]>;
  getAncestorsOf(_id: string): Promise<ICategory[]>;
  isDescendantRelationship(
    ancestorId: string,
    descendantId: string
  ): Promise<boolean>;

  doesRequireAdminApproval(_id?: string | null): Promise<boolean>;
}

export const getDefaultPostReadCpUserLevel = (): ReadCpUserLevels => 'GUEST';
export const getDefaultWriteCpUserLevel = (): WriteCpUserLevels => 'REGISTERED';

export const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true },
  code: {
    type: String,
    index: true,
    sparse: true
  },
  thumbnail: String,
  parentId: { type: Types.ObjectId, index: true },

  userLevelReqPostRead: {
    type: String,
    requried: true,
    enum: _.keys(READ_CP_USER_LEVELS),
    default: getDefaultPostReadCpUserLevel
  },
  userLevelReqPostWrite: {
    type: String,
    requried: true,
    enum: _.keys(WRITE_CP_USER_LEVELS),
    default: getDefaultWriteCpUserLevel
  },

  // userLevelReqCommentRead: { type: String, requried: true, enum: _.keys(READ_CP_USER_LEVELS), default: (): ReadCpUserLevels => ('GUEST')},
  userLevelReqCommentWrite: {
    type: String,
    requried: true,
    enum: _.keys(WRITE_CP_USER_LEVELS),
    default: getDefaultWriteCpUserLevel
  },

  postsReqCrmApproval: {
    type: Boolean,
    required: true,
    default: (): boolean => false
  }
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class CategoryModel {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<CategoryDocument> {
      const cat = await models.Category.findById(_id);
      if (!cat) {
        throw new Error(`Category with \`{ "_id" : "${_id}" doesn't exist.}\``);
      }
      return cat;
    }
    public static async createCategory(
      input: InputCategoryInsert
    ): Promise<CategoryDocument> {
      if (input.code) {
        const exists = await models.Category.findOne({
          code: input.code
        }).lean();
        if (exists) {
          throw new Error(`A category with same code already exists`);
        }
      }
      return await models.Category.create(input);
    }
    public static async patchCategory(
      _id: string,
      input: InputCategoryPatch
    ): Promise<CategoryDocument> {
      const patch = { ...input } as Partial<Omit<ICategory, '_id'>>;

      if (patch.code) {
        const exists = await models.Category.find({
          _id: { $ne: Types.ObjectId(_id) },
          code: patch.code
        });
        if (exists) {
          throw new Error(`A category with same code already exists`);
        }
      }

      if (patch.parentId) {
        if (
          await models.Category.isDescendantRelationship(_id, patch.parentId)
        ) {
          throw new Error(
            `A category cannot be a subcategory of one of its own descendants`
          );
        }
      }

      await models.Category.updateOne({ _id }, patch);

      return models.Category.findByIdOrThrow(_id);
    }

    public static async deleteCategory(_id: string): Promise<CategoryDocument> {
      const cat = await models.Category.findByIdOrThrow(_id);

      const session = await con.startSession();
      session.startTransaction();

      try {
        await models.Post.updateMany(
          { categoryId: { $elemMatch: { $eq: _id } } },
          { $pull: { categoryId: Types.ObjectId(_id) } }
        );
        await models.Category.updateMany({ parentId: _id }, { parentId: null });
        await cat.remove();

        await session.commitTransaction();
      } catch (e) {
        await session.abortTransaction();
        throw e;
      }

      return cat;
    }

    public static async getDescendantsOf(_ids: string[]): Promise<ICategory[]> {
      const descendantsArrayName = 'descendants';

      const matchedCategories = await models.Category.aggregate([
        {
          $match: {
            _id: { $in: (_ids || []).map(v => Types.ObjectId(v)) }
          }
        },
        {
          $graphLookup: {
            from: models.Category.collection.collectionName,
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: descendantsArrayName
          }
        }
      ]);

      if (!matchedCategories?.length) {
        throw new Error(
          `Category with _id=${JSON.stringify(_ids)} doesn't exist`
        );
      }

      return (
        _.flatten(matchedCategories.map(x => x[descendantsArrayName])) || []
      );
    }

    public static async getAncestorsOf(_id: string): Promise<ICategory[]> {
      const ancestorsArrayName = 'ancestors';

      const results = await models.Category.aggregate([
        {
          $match: {
            _id: Types.ObjectId(_id)
          }
        },
        {
          $graphLookup: {
            from: models.Category.collection.collectionName,
            startWith: '$parentId',
            connectFromField: 'parentId',
            connectToField: '_id',
            as: ancestorsArrayName
          }
        }
      ]);

      if (!results?.length) {
        throw new Error(`Category with _id=${_id} doesn't exist`);
      }

      // it should contain only 1 category, since we $match-ed using its _id
      return results[0][ancestorsArrayName] || [];
    }

    public static async isDescendantRelationship(
      ancestorId: string,
      descendantId: string
    ): Promise<boolean> {
      const ancestors = await models.Category.getAncestorsOf(descendantId);
      const isInAncestors = ancestors.some(
        a => a._id.toString() === ancestorId
      );
      return isInAncestors;
    }

    public static async doesRequireAdminApproval(
      _id?: string | null
    ): Promise<boolean> {
      if (!_id) return false;

      const category = await models.Category.findById(_id);

      if (category?.postsReqCrmApproval) return true;

      return false;
    }
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<CategoryDocument, ICategoryModel>(
    'forum_categories',
    categorySchema
  );
};
