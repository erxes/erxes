import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { USER_TYPES, UserTypes } from '../../consts';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { posts } from '../../permissions';

export const POST_STATES = ['DRAFT', 'PUBLISHED'] as const;

export type PostStates = typeof POST_STATES[number];

export interface IPost {
  _id: any;
  categoryId?: string[] | null;
  content: string;
  description?: string | null;
  title: string;
  state: PostStates;
  thumbnail?: string | null;

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

  stateChangedAt: Date;
  stateChangedUserType: UserTypes;
  stateChangedById?: string;
  stateChangedByCpId?: string;
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

  'updatedUserType',
  'updatedAt',
  'updatedById',
  'updatedByCpId',

  'stateChangedUserType',
  'stateChangedAt',
  'stateChangedById',
  'stateChangedByCpId'
] as const;

export type PostCreateInput = Omit<IPost, typeof OMIT_FROM_INPUT[number]>;
export type PostPatchInput = Partial<Omit<PostCreateInput, 'state'>>;

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

export const postSchema = new Schema<PostDocument>({
  categoryId: { type: [Types.ObjectId] },
  title: { type: String },
  content: { type: String },
  description: String,
  state: {
    type: String,
    required: true,
    enum: POST_STATES,
    default: 'DRAFT',
    index: true
  },
  thumbnail: String,

  viewCount: { type: Number, default: 0 },
  trendScore: { type: Number, default: 0 },

  createdAt: { type: Date, required: true, default: () => new Date() },
  createdUserType: { type: String, required: true, enum: USER_TYPES },
  createdById: String,
  createdByCpId: String,

  updatedAt: { type: Date, required: true, default: () => new Date() },
  updatedUserType: { type: String, required: true, enum: USER_TYPES },
  updatedById: String,
  updatedByCpId: String,

  stateChangedAt: { type: Date, required: true, default: () => new Date() },
  stateChangedUserType: { type: String, required: true, enum: USER_TYPES },
  stateChangedById: String,
  stateChangedByCpId: String
});
postSchema.index({ categoryId: 1, state: 1 });
// mostly used by update query of updateTrendScoreOfPublished
postSchema.index({ state: 1, stateChangedAt: 1 });

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
      const res = await models.Post.create({
        ...input,

        createdUserType: USER_TYPES[0],
        createdById: user._id,

        updatedUserType: USER_TYPES[0],
        updatedById: user._id,

        stateChangedUserType: USER_TYPES[0],
        stateChangedById: user._id
      });
      return res;
    }
    public static async patchPost(
      _id: string,
      patch: PostPatchInput,
      user: IUserDocument
    ): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);
      _.extend(post, {
        ...patch,
        updatedUserType: USER_TYPES[0],
        updatedById: user._id,
        updatedAt: new Date()
      });
      await post.save();
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
      post.state = state;
      post.stateChangedAt = new Date();
      post.stateChangedById = user._id;
      post.stateChangedUserType = USER_TYPES[0];
      await post.save();
      return post;
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
      if (!cpUser) throw new Error(`Unauthorized`);
      const res = await models.Post.create({
        ...input,

        createdUserType: USER_TYPES[1],
        createdByCpId: cpUser.userId,

        updatedUserType: USER_TYPES[1],
        updatedByCpId: cpUser.userId,

        stateChangedUserType: USER_TYPES[1],
        stateChangedByCpId: cpUser.userId
      });
      return res;
    }
    public static async patchPostCp(
      _id: string,
      patch: PostPatchInput,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new Error(`Unauthorized`);
      const post = await models.Post.findByIdOrThrowCp(_id, cpUser);
      _.extend(post, {
        ...patch,
        updatedUserType: USER_TYPES[1],
        updatedByCpId: cpUser.userId,
        updatedAt: new Date()
      });
      await post.save();
      return post;
    }

    public static async deletePostCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new Error(`Unauthorized`);
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
      if (!cpUser) throw new Error(`Unauthorized`);
      const post = await models.Post.findByIdOrThrowCp(_id, cpUser);
      post.state = state;
      post.stateChangedAt = new Date();
      post.stateChangedById = cpUser.userId;
      post.stateChangedUserType = USER_TYPES[1];
      await post.save();
      return post;
    }

    public static async draftCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new Error(`Unauthorized`);
      return models.Post.changeStateCp(_id, 'DRAFT', cpUser);
    }
    public static async publishCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PostDocument> {
      if (!cpUser) throw new Error(`Unauthorized`);
      return models.Post.changeStateCp(_id, 'PUBLISHED', cpUser);
    }

    public static async updateTrendScoreOfPublished(query = {}) {
      const now = Date.now();
      console.log(
        '.....................asdfasdfasdf...........................'
      );
      await models.Post.find(
        { ...query, state: 'PUBLISHED' },
        { viewCount: 1, stateChangedAt: 1, trendScore: 1 }
      )
        .cursor()
        .eachAsync(async function updateTrendScores(post: PostDocument) {
          console.log(post);
          const elapsedSeconds = (now - post.stateChangedAt.getTime()) / 1000;
          post.trendScore = post.viewCount / elapsedSeconds;
          await post.save();
        });
    }
    /* >>> Client portal */
  }
  postSchema.loadClass(PostModel);

  models.Post = con.model<PostDocument, IPostModel>('forum_posts', postSchema);
};
