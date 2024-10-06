import { Model } from 'mongoose';

import { IPost, IPostDocument, postSchema } from './definitions/posts';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';

export interface IPostModel extends Model<IPostDocument> {
  getPosts: (query: any) => Promise<IPostDocument[]>;
  createPost: (doc: IPost) => Promise<IPostDocument>;
  updatePost: (_id: string, doc: IPost) => Promise<IPostDocument>;
  deletePost: (_id: string) => Promise<IPostDocument>;
  changeStatus: (_id: string, status: string) => Promise<IPostDocument>;
  increaseViewCount: (_id: string) => Promise<IPostDocument>;
}

export const loadPostClass = (models: IModels) => {
  class Posts {
    public static getPosts = async (query: any) => {
      const posts = await models.Posts.find(query).sort({ name: 1 }).lean();

      return posts;
    };

    public static createPost = async (doc: IPost) => {
      if (!doc.slug && doc.title) {
        doc.slug = slugify(doc.title, { lower: true });
      }

      return models.Posts.create(doc);
    };

    public static updatePost = async (_id: string, doc: IPost) => {
      if (!doc.slug && doc.title) {
        doc.slug = slugify(doc.title, { lower: true });
      }

      const post = await models.Posts.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true }
      );
      return post;
    };

    public static deletePost = async (_id: string) => {
      return models.Posts.deleteOne({ _id });
    };

    public static changeStatus = async (_id: string, status: string) => {
      return models.Posts.findOneAndUpdate(
        { _id },
        { $set: { status } },
        { new: true }
      );
    };

    public static increaseViewCount = async (_id: string) => {
      return models.Posts.findOneAndUpdate(
        { _id },
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    };
  }
  postSchema.loadClass(Posts);

  return postSchema;
};
