import { Document, Schema, Model, Connection, Types, model } from 'mongoose';
import { IModels } from './index';

export interface IPost {
  _id: any;
  categoryId: string;
  content: string;
  thumbnail?: string | null;
}

export type PostDocument = IPost & Document;
export interface IPostModel extends Model<PostDocument> {
  createPost(c: Omit<IPost, '_id'>): Promise<PostDocument>;
  patchPost(_id: string, c: Partial<Omit<IPost, '_id'>>): Promise<PostDocument>;
}

export const postSchema = new Schema<PostDocument>({
  categoryId: { type: Types.ObjectId, index: true },
  content: String,
  thumbnail: String
});

export const generateCategoryModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PostModel {
    public static async createPost(
      input: Omit<IPost, '_id'>
    ): Promise<PostDocument> {
      const res = await models.Post.create(input);
      return res;
    }
    public static async patchPost(
      _id: string,
      input: Partial<Omit<IPost, '_id'>>
    ): Promise<PostDocument> {
      await models.Post.updateOne({ _id }, input);
      const updated = await models.Post.findById(_id);
      if (!updated) {
        throw new Error(`Category with \`{ "_id" : "${_id}"} doesn't exist\``);
      }
      return updated;
    }
  }
  postSchema.loadClass(PostModel);

  models.Post = con.model<PostDocument, IPostModel>(
    'forum_categories',
    postSchema
  );
};
