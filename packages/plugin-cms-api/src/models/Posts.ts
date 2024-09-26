import { Model } from 'mongoose';

import {
  IPost,
  IPostDocument,
  postSchema,
} from './definitions/posts';
import { IModels } from '../connectionResolver';

export interface IPostModel extends Model<IPostDocument> {
  getPosts: (query: any) => Promise<IPostDocument[]>;
}

export const loadPostClass = (models: IModels) => {
  class Posts {
    public static getPosts = async (query: any) => {
      const posts = await models.Posts.find(query)
        .sort({ name: 1 })
        .lean();

      return posts;
    };
  }
  postSchema.loadClass(Posts);

  return postSchema;
};
