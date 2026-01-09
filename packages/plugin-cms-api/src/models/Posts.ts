import { Model } from 'mongoose';

import { IPost, IPostDocument, postSchema } from './definitions/posts';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';
import { htmlToText } from 'html-to-text';
import { generateUniqueSlug } from './utils';


export interface IPostModel extends Model<IPostDocument> {
  getPosts: (query: any) => Promise<IPostDocument[]>;
  createPost: (doc: IPost) => Promise<IPostDocument>;
  updatePost: (_id: string, doc: IPost) => Promise<IPostDocument>;
  deletePost: (_id: string) => Promise<IPostDocument>;
  changeStatus: (
    _id: string,
    status: 'draft' | 'published' | 'archived' | 'scheduled'
  ) => Promise<IPostDocument>;
  increaseViewCount: (_id: string) => Promise<IPostDocument>;
  toggleFeatured: (_id: string) => Promise<IPostDocument>;
}

const prepareExcerpt = (content: string) => {
  const excerptLength = 100;
  const plainTextContent = htmlToText(content, { wordwrap: 130 });

  const excerpt =
    plainTextContent.length > excerptLength
      ? plainTextContent.substring(0, excerptLength) + '...'
      : plainTextContent;

  return excerpt;
};

export const loadPostClass = (models: IModels) => {
  class Posts {
    public static getPosts = async (query: any, sort: any) => {
      const posts = await models.Posts.find(query).sort(sort).lean();

      return posts;
    };

    public static createPost = async (doc: IPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(models.Posts, doc.clientPortalId, 'slug', baseSlug);
      }

      if (doc.content && !doc.excerpt) {
        doc.excerpt = prepareExcerpt(doc.content);
      }

      if (doc.status === 'published' && !doc.publishedDate) {
        doc.publishedDate = new Date();
      }

      return models.Posts.create(doc);
    };

    public static updatePost = async (_id: string, doc: IPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(models.Posts, doc.clientPortalId, 'slug', baseSlug);
      }

      const post = await models.Posts.findOne({ _id });

      if (!post) {
        throw new Error('Post not found');
      }

      if (doc.content && !doc.excerpt && !post.excerpt) {
        doc.excerpt = prepareExcerpt(doc.content);
      }

      if (doc.status === 'published' && !post.publishedDate) {
        doc.publishedDate = new Date();
      }

      await models.Posts.updateOne({ _id }, { $set: { ...doc } });

      return models.Posts.findOne({ _id });
    };

    public static deletePost = async (_id: string) => {
      return models.Posts.deleteOne({ _id });
    };

    public static changeStatus = async (
      _id: string,
      status: 'draft' | 'published' | 'archived' | 'scheduled'
    ) => {
      const post = await models.Posts.findOne({ _id });
      if (!post) {
        throw new Error('Post not found');
      }

      if (status === 'published' && !post.publishedDate) {
        post.publishedDate = new Date();
      }
      post.status = status;
      return post.save();
    };

    public static increaseViewCount = async (_id: string) => {
      return models.Posts.findOneAndUpdate(
        { _id },
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    };

    public static toggleFeatured = async (_id: string) => {
      const post = await models.Posts.findOne({ _id });
      if (!post) {
        throw new Error('Post not found');
      }
      post.featured = !post.featured;
      if (post.featured) {
        post.featuredDate = new Date();
      } else {
        post.featuredDate = null;
      }
      return post.save();
    };
  }
  postSchema.loadClass(Posts);

  return postSchema;
};
