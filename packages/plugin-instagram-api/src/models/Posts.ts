import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { IPostDocument, postSchema } from './definitions/posts';

export interface IPostModel extends Model<IPostDocument> {
  getPost(selector: any, isLean?: boolean): Promise<IPostDocument>;
}

export const loadPostClass = (models: IModels) => {
  class Post {
    public static async getPost(selector: any, isLean: boolean) {
      let post = await models.Posts.findOne(selector);

      if (isLean) {
        post = await models.Posts.findOne(selector).lean();
      }

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    }
  }

  postSchema.loadClass(Post);

  return postSchema;
};
