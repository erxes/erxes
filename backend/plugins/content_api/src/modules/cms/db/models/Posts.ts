import { Model } from 'mongoose';

import { IPost, IPostDocument } from '@/cms/@types/posts';
import { IModels } from '~/connectionResolvers';
import slugify from 'slugify';
import { htmlToText } from 'html-to-text';
import { postSchema } from '@/cms/db/definitions/posts';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface IPostModel extends Model<IPostDocument> {
  getPosts: (query: any) => Promise<IPostDocument[]>;
  createPost: (doc: IPost) => Promise<IPostDocument>;
  updatePost: (_id: string, doc: IPost) => Promise<IPostDocument>;
  deletePost: (_id: string) => Promise<IPostDocument>;
  changeStatus: (
    _id: string,
    status: 'draft' | 'published' | 'archived' | 'scheduled',
  ) => Promise<IPostDocument>;
  increaseViewCount: (_id: string) => Promise<IPostDocument>;
  toggleFeatured: (_id: string) => Promise<IPostDocument>;
}

const prepareExcerpt = (content: string) => {
  const excerptLength = 100;
  const plainTextContent = htmlToText(content, { wordwrap: 130 });

  return plainTextContent.length > excerptLength
    ? plainTextContent.substring(0, excerptLength) + '...'
    : plainTextContent;
};

export const loadPostClass = (models: IModels) => {
  class Posts {
    public static getNextPostCount = async (clientPortalId: string) => {
      const latestPostWithCount = await models.Posts.findOne({
        clientPortalId,
        count: { $exists: true },
      })
        .sort({ count: -1 })
        .select({ count: 1 })
        .lean();

      if (typeof latestPostWithCount?.count === 'number') {
        return latestPostWithCount.count + 1;
      }

      return models.Posts.countDocuments({ clientPortalId });
    };

    public static async generateUniqueSlug(
      title: string,
      attempt = 0,
    ): Promise<string> {
      let baseSlug = slugify(title, { lower: true });

      // If it's a retry attempt, append the attempt number to the slug
      if (attempt > 0) {
        baseSlug = `${baseSlug}-${attempt}`;
      }

      // Check if the slug already exists
      const existingPost = await models.Posts.findOne({ slug: baseSlug });

      // If a post with this slug exists, recursively try again with an incremented attempt number
      if (existingPost) {
        return this.generateUniqueSlug(title, attempt + 1);
      }

      // Return the unique slug
      return baseSlug;
    }

    public static readonly getPosts = async (query: any, sort: any) => {
      return models.Posts.find(query).sort(sort).lean();
    };

    public static readonly createPost = async (doc: IPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.Posts,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      if (doc.content && !doc.excerpt) {
        doc.excerpt = prepareExcerpt(doc.content);
      }

      if (doc.status === 'published') {
        doc.publishedDate = new Date();
      }

      if (doc.count === undefined) {
        doc.count = await this.getNextPostCount(doc.clientPortalId);
      }

      return models.Posts.create(doc);
    };

    public static readonly updatePost = async (_id: string, doc: IPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.Posts,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
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

    public static readonly deletePost = async (_id: string) => {
      return models.Posts.deleteOne({ _id });
    };

    public static readonly changeStatus = async (
      _id: string,
      status: 'draft' | 'published' | 'archived' | 'scheduled',
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

    public static readonly increaseViewCount = async (_id: string) => {
      return models.Posts.findOneAndUpdate(
        { _id },
        { $inc: { viewCount: 1 } },
        { new: true },
      );
    };

    public static readonly toggleFeatured = async (_id: string) => {
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
