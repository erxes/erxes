import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';

export const POSSIBLE_STATES = ['DRAFT', 'PUBLISHED'] as const;

export interface IPost {
  _id: any;
  categoryId: string;
  content: string;
  title: string;
  state: typeof POSSIBLE_STATES[number];
  thumbnail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById?: string;
  stateChangedAt?: Date;
  stateChangedById?: string;
}

export type PostDocument = IPost & Document;
export interface IPostModel extends Model<PostDocument> {
  findByIdOrThrow(_id: string): Promise<PostDocument>;
  createPost(c: Omit<IPost, '_id'>): Promise<PostDocument>;
  patchPost(_id: string, c: Partial<Omit<IPost, '_id'>>): Promise<PostDocument>;
  deletePost(_id: string): Promise<PostDocument>;
}

export const postSchema = new Schema<PostDocument>(
  {
    categoryId: { type: Types.ObjectId },
    title: String,
    content: { type: String, required: true },
    state: {
      type: String,
      required: true,
      enum: POSSIBLE_STATES,
      default: POSSIBLE_STATES[0]
    },
    thumbnail: String,
    createdById: { type: String, required: true },
    updatedById: String,
    stateChangedAt: Date,
    stateChangedById: String
  },
  {
    timestamps: true
  }
);
postSchema.index({ categoryId: 1, state: 1 });

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
      input: Omit<IPost, '_id'>
    ): Promise<PostDocument> {
      const res = await models.Post.create(input);
      return res;
    }
    public static async patchPost(
      _id: string,
      patch: Partial<Omit<IPost, '_id'>>
    ): Promise<PostDocument> {
      await models.Post.updateOne({ _id }, patch);
      const updated = await models.Post.findById(_id);
      if (!updated) {
        throw new Error(`Post with \`{ "_id" : "${_id}"}\` doesn't exist`);
      }
      return updated;
    }

    public static async deletePost(_id: string): Promise<PostDocument> {
      const post = await models.Post.findByIdOrThrow(_id);
      await post.remove();
      await models.Comment.deleteMany({ postId: _id });

      return post;
    }
  }
  postSchema.loadClass(PostModel);

  models.Post = con.model<PostDocument, IPostModel>('forum_posts', postSchema);
};
