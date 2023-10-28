import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';
import {
  ALL_CP_USER_LEVELS,
  ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES,
  CpUserLevels,
  Permissions,
  ReadCpUserLevels,
  READ_CP_USER_LEVELS,
  WriteCpUserLevels,
  WRITE_CP_USER_LEVELS
} from '../../consts';
import { ICpUser } from '../../graphql';
import { PostDocument } from './post';
import {
  InsufficientPermissionError,
  InsufficientUserLevelError,
  LoginRequiredError
} from '../../customErrors';

export interface ICategory {
  _id: any;
  name: string;
  code?: string | null;
  thumbnail?: string | null;
  parentId?: string | null;
  description?: string | null;

  // userLevelReqCommentRead: ReadCpUserLevels;
  userLevelReqCommentWrite: WriteCpUserLevels;
  userLevelReqPostRead: ReadCpUserLevels;
  userLevelReqPostWrite: WriteCpUserLevels;

  postReadRequiresPermissionGroup?: boolean | null;
  postWriteRequiresPermissionGroup?: boolean | null;
  commentWriteRequiresPermissionGroup?: boolean | null;

  postsReqCrmApproval: boolean;

  order?: number | null;
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

  isUserAllowedToRead(
    post: PostDocument,
    user?: ICpUser | null
  ): Promise<
    | undefined
    | {
        requiredLevel?: CpUserLevels;
        isPermissionGroupRequired?: boolean;
      }
  >;

  ensureUserIsAllowed(
    permission: Exclude<Permissions, 'READ_POST'>,
    category?: CategoryDocument | null,
    user?: ICpUser | null
  ): Promise<void>;
  categoriesUserAllowedToPost(
    userId: string | null | undefined
  ): Promise<ICategory[] | null | undefined>;
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
  description: String,

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
  },

  postReadRequiresPermissionGroup: Boolean,
  postWriteRequiresPermissionGroup: Boolean,
  commentWriteRequiresPermissionGroup: Boolean,

  order: Number
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
      if (input.userLevelReqPostWrite === 'NO_ONE') {
        input.postWriteRequiresPermissionGroup = false;
      }
      if (input.userLevelReqCommentWrite === 'NO_ONE') {
        input.commentWriteRequiresPermissionGroup = false;
      }
      if (
        input.userLevelReqPostRead === 'NO_ONE' ||
        input.userLevelReqPostRead === 'GUEST'
      ) {
        input.postReadRequiresPermissionGroup = false;
      }
      return await models.Category.create(input);
    }
    public static async patchCategory(
      _id: string,
      input: InputCategoryPatch
    ): Promise<CategoryDocument> {
      const patch = { ...input } as Partial<Omit<ICategory, '_id'>>;

      if (patch.code) {
        const exists = await models.Category.findOne({
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

      if (input.userLevelReqPostRead === 'GUEST') {
        patch.postReadRequiresPermissionGroup = false;
      }

      await models.Category.updateOne({ _id }, patch);

      return models.Category.findByIdOrThrow(_id);
    }

    public static async deleteCategory(_id: string): Promise<CategoryDocument> {
      const cat = await models.Category.findByIdOrThrow(_id);

      const session = await con.startSession();
      session.startTransaction();

      try {
        await models.Post.updateMany({ categoryId: _id }, { categoryId: null });
        await models.Category.updateMany({ parentId: _id }, { parentId: null });
        await models.PermissionGroupCategoryPermit.deleteMany({
          categoryId: _id
        });
        await models.Quiz.updateMany({ categoryId: _id }, { categoryId: null });
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

    public static async isUserAllowedToRead(
      post: PostDocument,
      user?: ICpUser | null
    ): Promise<
      | undefined
      | {
          requiredLevel?: CpUserLevels;
          isPermissionGroupRequired?: boolean;
        }
    > {
      if (
        post.createdByCpId &&
        user?.userId &&
        post.createdByCpId === user?.userId
      )
        return;

      const categoryId = post.categoryId;

      if (!categoryId) {
        return;
      }

      const category = await models.Category.findByIdOrThrow(categoryId);
      const requiredLevel = category.userLevelReqPostRead;
      const postReadRequiresPermissionGroup = !!category.postReadRequiresPermissionGroup;

      // everyone is allowed to read
      if (requiredLevel === 'GUEST') return;

      const userLevel = await models.ForumClientPortalUser.getUserLevel(user);

      const allowedByUserLevel =
        ALL_CP_USER_LEVELS[userLevel] >= ALL_CP_USER_LEVELS[requiredLevel];

      let hasPermit = false;
      const fetchHasPermit = async () => {
        hasPermit = await models.PermissionGroupCategoryPermit.isUserPermitted(
          categoryId,
          'READ_POST',
          user?.userId
        );
      };

      if (!postReadRequiresPermissionGroup) {
        if (allowedByUserLevel) return;
        await fetchHasPermit();
        if (hasPermit) return;
      } else {
        await fetchHasPermit();
        if (allowedByUserLevel && hasPermit) return;
      }

      if (postReadRequiresPermissionGroup) {
        return {
          requiredLevel: allowedByUserLevel ? undefined : requiredLevel,
          isPermissionGroupRequired: hasPermit ? undefined : true
        };
      } else {
        return { requiredLevel };
      }
    }

    public static async ensureUserIsAllowed(
      permission: Exclude<Permissions, 'READ_POST'>,
      category?: CategoryDocument | null,
      user?: ICpUser | null
    ): Promise<void> {
      if (!user) throw new LoginRequiredError();

      if (!category) return;

      const userLevel = await models.ForumClientPortalUser.getUserLevel(user);

      const [requiredLevel, requiresPermissionGroup]: [
        CpUserLevels,
        boolean | null | undefined
      ] = (() => {
        if (permission === 'WRITE_COMMENT') {
          return [
            category.userLevelReqCommentWrite,
            category.commentWriteRequiresPermissionGroup
          ];
        } else if (permission === 'WRITE_POST') {
          return [
            category.userLevelReqPostWrite,
            category.postWriteRequiresPermissionGroup
          ];
        } else {
          throw new Error(
            'Tried to check for an unrecognized write permission'
          );
        }
      })();

      const isAllowedByLevel =
        ALL_CP_USER_LEVELS[userLevel] >= ALL_CP_USER_LEVELS[requiredLevel];

      let hasPermit = false;
      const fetchHasPermit = async (): Promise<boolean> => {
        hasPermit = await models.PermissionGroupCategoryPermit.isUserPermitted(
          category._id,
          permission,
          user.userId
        );
        return hasPermit;
      };

      if (!requiresPermissionGroup) {
        if (isAllowedByLevel) return;

        await fetchHasPermit();
        if (hasPermit) return;
      }

      if (requiresPermissionGroup) {
        await fetchHasPermit();
        if (hasPermit && isAllowedByLevel) return;
      }

      const insufficientLevel = new InsufficientUserLevelError(
        ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES[requiredLevel],
        requiredLevel
      );
      const insufficientPermission = new InsufficientPermissionError();

      if (!requiresPermissionGroup) {
        throw insufficientLevel;
      } else if (requiresPermissionGroup) {
        if (requiredLevel === 'NO_ONE' || hasPermit) throw insufficientLevel;
        else throw insufficientPermission;
      }
    }

    public static async categoriesUserAllowedToPost(
      userId: string | undefined | null
    ): Promise<ICategory[] | null | undefined> {
      if (!userId) return [];

      const userLevel = await models.ForumClientPortalUser.getUserLevel({
        userId
      });

      const allowedLevels = Object.entries(ALL_CP_USER_LEVELS)
        .filter(([_, v]) => v <= ALL_CP_USER_LEVELS[userLevel])
        .map(([k]) => k);

      const permittedCategoryIds: Types.ObjectId[] = await models.PermissionGroupCategoryPermit.userPermittedCategoryIds(
        userId
      );

      const categories = await models.Category.find({
        $or: [
          {
            postWriteRequiresPermissionGroup: { $ne: true },
            $or: [
              { userLevelReqPostWrite: { $in: allowedLevels } },
              { _id: { $in: permittedCategoryIds } }
            ]
          },
          {
            postWriteRequiresPermissionGroup: true,
            userLevelReqPostWrite: { $in: allowedLevels },
            _id: { $in: permittedCategoryIds }
          }
        ]
      });

      return categories;
    }
  }
  categorySchema.loadClass(CategoryModel);

  models.Category = con.model<CategoryDocument, ICategoryModel>(
    'forum_categories',
    categorySchema
  );
};
