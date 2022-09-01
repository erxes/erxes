import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { stringify } from 'querystring';
import { USER_TYPES, UserTypes } from '../../consts';
import { IModels } from './index';

export const POST_STATES = ['DRAFT', 'PUBLISHED'] as const;

export type PostStates = typeof POST_STATES[number];

export interface IPost {
  _id: any;
  categoryId: string;
  content: string;
  title: string;
  state: PostStates;
  thumbnail?: string | null;

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

  commentCount: Number;
}

export type PostDocument = IPost & Document;

const OmitFromInput = [
  '_id',

  'commentCount',

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

export type PostCreateInput = Omit<IPost, typeof OmitFromInput[number]>;
export type PostPatchInput = Partial<Omit<PostCreateInput, 'state'>>;

export interface IPostModel extends Model<PostDocument> {
  reCalculateCommentCount(_id: string): Promise<void>;
  incCommentCount(_id: string, value: number): Promise<PostDocument>;
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
}

export const postSchema = new Schema<PostDocument>({
  categoryId: { type: Types.ObjectId },
  title: { type: String },
  content: { type: String },
  state: {
    type: String,
    required: true,
    enum: POST_STATES,
    default: POST_STATES[0]
  },
  thumbnail: String,

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
  stateChangedByCpId: String,

  commentCount: { type: Number, required: true, default: 0 }
});
postSchema.index({ categoryId: 1, state: 1 });

export const generatePostModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PostModel {
    public static async reCalculateCommentCount(_id: string): Promise<void> {
      const post = await models.Post.findByIdOrThrow(_id);
      const count = await models.Comment.find({ postId: _id }).countDocuments();
      post.commentCount = count;
      await post.save();
    }
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
        commentCount: 0,

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
      await models.Post.updateOne(
        { _id },
        {
          ...patch,
          updatedUserType: USER_TYPES[0],
          updatedById: user._id,
          updatedAt: new Date()
        }
      );
      const updated = await models.Post.findByIdOrThrow(_id);
      return updated;
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

    public static async incCommentCount(
      _id: string,
      value: number
    ): Promise<PostDocument> {
      await models.Post.updateOne({ _id }, { $inc: { commentCount: value } });
      return models.Post.findByIdOrThrow(_id);
    }
  }
  postSchema.loadClass(PostModel);

  models.Post = con.model<PostDocument, IPostModel>('forum_posts', postSchema);
};
