import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import {
  USER_TYPES,
  UserTypes,
  ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES
} from '../../consts';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { assert } from 'console';
import {
  InsufficientUserLevelError,
  LoginRequiredError
} from '../../customErrors';
import { notifyUsersPublishedPost } from './utils';

export const POST_STATES = ['DRAFT', 'PUBLISHED'] as const;

export const ADMIN_APPROVAL_STATES = ['PENDING', 'APPROVED', 'DENIED'] as const;

export type PostStates = typeof POST_STATES[number];
export type AdminApprovalStates = typeof ADMIN_APPROVAL_STATES[number];

interface CommonPostFields {
  title?: string | null;
  content?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  custom: any;
  thumbnailAlt?: string | null;
}

interface TranslationsFields extends CommonPostFields {
  lang: string;
}

export interface IPost extends CommonPostFields {
  _id: any;
  categoryId?: string | null;
  state: PostStates;
  lang?: string | null;
  categoryApprovalState: AdminApprovalStates;

  translations?: TranslationsFields[] | null;

  viewCount: number;

  trendScore: number;

  createdAt: Date;
  createdUserType: UserTypes;
  createdById?: string;
  createdByCpId?: string;

  updatedAt: Date;
  updatedUserType: UserTypes;
  updatedById?: string;
  updatedByCpId?: string;

  lastPublishedAt?: Date | null;

  customIndexed: any;

  tagIds?: string[] | null;

  requiredLevel?: string | null;
  isPermissionRequired?: boolean | null;
}

export type PostDocument = IPost & Document;

const OMIT_FROM_INPUT = [
  '_id',

  'viewCount',
  'trendScore',

  'createdUserType',
  'createdAt',
  'createdById',
  'createdByCpId',

  'categoryApprovalState',

  'updatedUserType',
  'updatedAt',
  'updatedById',
  'updatedByCpId',

  'lastPublishedAt',

  'requiredLevel',
  'isPermissionRequired'
] as const;

export type PostCreateInput = Omit<IPost, typeof OMIT_FROM_INPUT[number]>;
export type PostPatchInput = Partial<PostCreateInput>;

export interface IPostModel extends Model<PostDocument> {
  findByIdOrThrow(_id: string): Promise<PostDocument>;

  createPost(c: PostCreateInput, user: IUserDocument): Promise<PostDocument>;
  patchPost(
    _id: string,
    c: PostPatchInput,
    user: IUserDocument
  ): Promise<PostDocument>;
  deletePost(_id: string): Promise<PostDocument>;

  changeState(
    _id: string,
    state: PostStates,
    user: IUserDocument
  ): Promise<PostDocument>;

  draft(_id: string, user: IUserDocument): Promise<PostDocument>;
  publish(_id: string, user: IUserDocument): Promise<PostDocument>;

  updateTrendScoreOfPublished(query: any);

  addTranslation(
    _id: string,
    lang: string,
    translation: Omit<TranslationsFields, 'lang'>,
    isClientPortal?: boolean,
    cpUser?: ICpUser
  );
  updateTranslation(
    _id: string,
    lang: string,
    translation: Omit<TranslationsFields, 'lang'>,
    isClientPortal?: boolean,
    cpUser?: ICpUser
  );
  removeTranslation(
    _id: string,
    lang: string,
    isClientPortal?: boolean,
    cpUser?: ICpUser
  );

  /* <<< Client portal */
  findByIdOrThrowCp(_id: string, cpUser?: ICpUser): Promise<PostDocument>;
  createPostCp(c: PostCreateInput, user?: ICpUser): Promise<PostDocument>;
  patchPostCp(
    _id: string,
    c: PostPatchInput,
    user?: ICpUser
  ): Promise<PostDocument>;
  deletePostCp(_id: string, user?: ICpUser): Promise<PostDocument>;

  changeStateCp(
    _id: string,
    state: PostStates,
    user?: ICpUser
  ): Promise<PostDocument>;

  draftCp(_id: string, user?: ICpUser): Promise<PostDocument>;
  publishCp(_id: string, user?: ICpUser): Promise<PostDocument>;
  /* >>> Client portal */
}

const common = {
  title: { type: String },
  content: { type: String },
  description: { type: String },
  thumbnail: String,
  custom: Schema.Types.Mixed,
  thumbnailAlt: String
};

export const postSchema = new Schema<PostDocument>({
  categoryId: { type: Types.ObjectId, index: true },
  categoryApprovalState: {
    type: String,
    required: true,
    enum: ADMIN_APPROVAL_STATES,
    index: true
  },
  state: {
    type: String,
    required: true,
    enum: POST_STATES,
    index: true,
    default: POST_STATES[0]
  },
  ...common,
  lang: String,

  translations: [
    {
      _id: false,
      lang: { type: String, required: true },
      ...common
    }
  ],

  viewCount: { type: Number, default: 0 },
  trendScore: { type: Number, default: 0 },

  createdAt: { type: Date, required: true, default: () => new Date() },
  createdUserType: { type: String, required: true, enum: USER_TYPES },
  createdById: String,
  createdByCpId: { type: String, index: true },

  updatedAt: { type: Date, required: true, default: () => new Date() },
  updatedUserType: { type: String, required: true, enum: USER_TYPES },
  updatedById: String,
  updatedByCpId: String,

  lastPublishedAt: Date,

  customIndexed: Schema.Types.Mixed,

  tagIds: [String]
});
// used by client portal front-end
postSchema.index({ state: 1, categoryApprovalState: 1, categoryId: 1 });
// mostly used by update query of updateTrendScoreOfPublished
postSchema.index({ lastPublishedAt: 1, state: 1 });

postSchema.index({ tagIds: 1, state: 1 });

postSchema.index({ lastPublishedAt: -1 });

postSchema.index({
  title: 'text',
  'translations.title': 'text'
});

export const generatePostModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PostModel {
    public static async findByIdOrThrow(_id: string): Promise<PostDocument> {
      const post = await models.Post.findById(_id);
      if (!post) {
        throw new Error(`Post with \`{ "_id" : "${_id}"}\` doesn't exist`);
      }
      return post;
    }
    public static async createPost(
      input: PostCreateInput,
      user: IUserDocument
    ): Promise<PostDocument> {
      // admin posts are always approved
      const categoryApprovalState: AdminApprovalStates = 'APPROVED';

      let lastPublishedAt = input.state === 'PUBLISHED' ? new Date() : null;

      const res = await models.Post.create({
        ...input,

        categoryApprovalState,

        createdUserType: USER_TYPES[0],
        createdById: user._id,

        updatedUserType: USER_TYPES[0],
        updatedById: user._id,

        lastPublishedAt
      });
      if (res.state === 'PUBLISHED') {
        await notifyUsersPublishedPost(subdomain, models, res);
      }
      return res;
    }
    public static async patchPost(
      _id: string,
      patch: PostPatchInput,
      user: IUserDocument
    ): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);

      const originalState = post.state;

      const update: Partial<Omit<IPost, '_id'>> = {
        ...patch,
        updatedUserType: USER_TYPES[0],
        updatedById: user._id,
        updatedAt: new Date()
      };

      if (originalState === 'DRAFT' && patch.state === 'PUBLISHED') {
        update.lastPublishedAt = new Date();
        update.viewCount = 0;
      }

      _.assign(post, {
        ...patch,
        updatedUserType: USER_TYPES[0],
        updatedById: user._id,
        updatedAt: new Date()
      });

      await post.save();

      if (originalState === 'DRAFT' && patch.state === 'PUBLISHED') {
        await notifyUsersPublishedPost(subdomain, models, post);
      }

      return post;
    }

    public static async deletePost(_id: string): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);
      await post.remove();
      await models.Comment.deleteMany({ postId: _id });
      return post;
    }

    public static async changeState(
      _id: string,
      state: PostStates,
      user: IUserDocument
    ): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);
      return changeStateCommon(subdomain, models, post, state, user._id, 'CRM');
    }

    public static async draft(
      _id: string,
      user: IUserDocument
    ): Promise<PostDocument> {
      return models.Post.changeState(_id, 'DRAFT', user);
    }
    public static async publish(
      _id: string,
      user: IUserDocument
    ): Promise<PostDocument> {
      return models.Post.changeState(_id, 'PUBLISHED', user);
    }

    public static async addTranslation(
      _id: string,
      lang: string,
      translation: Omit<TranslationsFields, 'lang'>,
      isClientPortal?: boolean,
      cpUser?: ICpUser
    ) {
      const post = await (() => {
        if (!isClientPortal) return models.Post.findByIdOrThrow(_id);

        if (!cpUser?.userId) throw new LoginRequiredError();

        return models.Post.findByIdOrThrowCp(_id, cpUser);
      })();

      const translationDoc = { ...translation, lang };

      if (!post.translations?.length) {
        await models.Post.updateOne(
          { _id },
          { $set: { translations: [translationDoc] } }
        );
      } else {
        const exists = post.translations.some(t => t.lang === lang);
        if (exists) {
          throw new Error(`Translation already exists`);
        }
        await models.Post.updateOne(
          { _id },
          { $push: { translations: translationDoc } }
        );
      }
    }
    public static async updateTranslation(
      _id: string,
      lang: string,
      translation: Omit<TranslationsFields, 'lang'>,
      isClientPortal?: boolean,
      cpUser?: ICpUser
    ) {
      const post = await (() => {
        if (!isClientPortal) return models.Post.findByIdOrThrow(_id);

        if (!cpUser?.userId) throw new LoginRequiredError();

        return models.Post.findByIdOrThrowCp(_id, cpUser);
      })();

      if (!post.translations?.some(t => t.lang === lang)) {
        throw new Error("Translation doesn't exist");
      }

      const translationDoc = { ...translation, lang };

      await models.Post.updateOne(
        { _id },
        {
          $set: {
            'translations.$[elem]': translationDoc
          }
        },
        {
          arrayFilters: [{ 'elem.lang': lang }]
        }
      );
    }
    public static async removeTranslation(
      _id: string,
      lang: string,
      isClientPortal?: boolean,
      cpUser?: ICpUser
    ) {
      const post = await (() => {
        if (!isClientPortal) return models.Post.findByIdOrThrow(_id);

        if (!cpUser?.userId) throw new LoginRequiredError();

        return models.Post.findByIdOrThrowCp(_id, cpUser);
      })();

      if (!post.translations?.some(t => t.lang === lang)) {
        throw new Error("Translation already doesn't exist");
      }

      await models.Post.updateOne(
        { _id },
        {
          $pull: {
            translations: {
              lang
            }
          }
        }
      );
    }

    /* <<< Client portal */
    public static async findByIdOrThrowCp(
      _id: string,
      cpUser: ICpUser
    ): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);

      if (post.createdByCpId !== cpUser.userId) {
        throw new Error(`This post doesn't belong to the current user`);
      }

      return post;
    }
    public static async createPostCp(
      input: PostCreateInput,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new LoginRequiredError();

      const category = await models.Category.findById(input.categoryId);

      await models.Category.ensureUserIsAllowed('WRITE_POST', category, cpUser);

      const categoryApprovalState: AdminApprovalStates = category?.postsReqCrmApproval
        ? 'PENDING'
        : 'APPROVED';

      const lastPublishedAt = input.state === 'PUBLISHED' ? new Date() : null;

      const res = await models.Post.create({
        ...input,
        categoryApprovalState,

        createdUserType: USER_TYPES[1],
        createdByCpId: cpUser.userId,

        updatedUserType: USER_TYPES[1],
        updatedByCpId: cpUser.userId,

        lastPublishedAt
      });

      if (res.state === 'PUBLISHED') {
        await notifyUsersPublishedPost(subdomain, models, res);
      }
      return res;
    }
    public static async patchPostCp(
      _id: string,
      patch: PostPatchInput,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new LoginRequiredError();

      const post = await models.Post.findByIdOrThrowCp(_id, cpUser);

      const originalState = post.state;

      const resultingCategoryId =
        patch.categoryId === undefined ? post.categoryId : patch.categoryId;

      const category = await models.Category.findById(resultingCategoryId);

      await models.Category.ensureUserIsAllowed('WRITE_POST', category, cpUser);

      const categoryApprovalState: AdminApprovalStates = category?.postsReqCrmApproval
        ? 'PENDING'
        : 'APPROVED';

      const update: Partial<Omit<IPost, '_id'>> = {
        ...patch,
        categoryApprovalState,
        updatedUserType: USER_TYPES[1],
        updatedByCpId: cpUser.userId,
        updatedAt: new Date()
      };

      if (originalState === 'DRAFT' && update.state === 'PUBLISHED') {
        update.lastPublishedAt = new Date();
        update.viewCount = 0;
      }

      _.assign(post, update);

      if (originalState === 'DRAFT' && post.state === 'PUBLISHED') {
        await notifyUsersPublishedPost(subdomain, models, post);
      }
      await post.save();
      return post;
    }

    public static async deletePostCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new LoginRequiredError();
      const post = await models.Post.findByIdOrThrowCp(_id, cpUser);
      await post.remove();
      await models.Comment.deleteMany({ postId: _id });
      return post;
    }

    public static async changeStateCp(
      _id: string,
      state: PostStates,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new LoginRequiredError();
      const post = await models.Post.findByIdOrThrowCp(_id, cpUser);
      const res = changeStateCommon(
        subdomain,
        models,
        post,
        state,
        cpUser.userId,
        'CP'
      );

      return res;
    }

    public static async draftCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      return models.Post.changeStateCp(_id, 'DRAFT', cpUser);
    }
    public static async publishCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      return models.Post.changeStateCp(_id, 'PUBLISHED', cpUser);
    }

    public static async updateTrendScoreOfPublished(query = {}) {
      const now = Date.now();
      await models.Post.find(
        { ...query, state: 'PUBLISHED' },
        { viewCount: 1, lastPublishedAt: 1, trendScore: 1 },
        { readPreference: 'secondaryPreferred' }
      )
        .cursor()
        .eachAsync(async function updateTrendScores(post: PostDocument) {
          if (!post.lastPublishedAt) return;

          const elapsedSeconds = (now - post.lastPublishedAt.getTime()) / 1000;
          post.trendScore = post.viewCount / elapsedSeconds;
          await post.save();
        });
    }
    /* >>> Client portal */
  }
  postSchema.loadClass(PostModel);

  models.Post = con.model<PostDocument, IPostModel>('forum_posts', postSchema);
  models.Post.collection.createIndex({ 'customIndexed.$**': 1 });
};

async function changeStateCommon(
  subdomain: string,
  models: IModels,
  post: PostDocument,
  state: PostStates,
  userId: string,
  userType: UserTypes
) {
  const originalState = post.state;
  post.state = state;

  post.viewCount = 0;

  if (originalState === 'DRAFT' && state === 'PUBLISHED') {
    post.lastPublishedAt = new Date();
  }

  await post.save();

  if (originalState === 'DRAFT' && post.state === 'PUBLISHED') {
    await notifyUsersPublishedPost(subdomain, models, post);
  }
  return post;
}
