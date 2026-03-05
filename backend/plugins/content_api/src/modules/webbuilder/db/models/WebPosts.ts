import { Model } from 'mongoose';
import slugify from 'slugify';
import { htmlToText } from 'html-to-text';

import { IWebPost, IWebPostDocument } from '@/webbuilder/@types/webPosts';
import { IModels } from '~/connectionResolvers';
import { webPostSchema } from '@/webbuilder/db/definitions/webPosts';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface IWebPostModel extends Model<IWebPostDocument> {
  getPosts: (query: any, sort: any) => Promise<IWebPostDocument[]>;
  createPost: (doc: IWebPost) => Promise<IWebPostDocument>;
  updatePost: (_id: string, doc: IWebPost) => Promise<IWebPostDocument>;
  deletePost: (_id: string) => Promise<IWebPostDocument>;
  changeStatus: (
    _id: string,
    status: 'draft' | 'published' | 'archived' | 'scheduled',
  ) => Promise<IWebPostDocument>;
  increaseViewCount: (_id: string) => Promise<IWebPostDocument>;
  toggleFeatured: (_id: string) => Promise<IWebPostDocument>;
}

const prepareExcerpt = (content: string) => {
  const excerptLength = 100;
  const plainTextContent = htmlToText(content, { wordwrap: 130 });

  return plainTextContent.length > excerptLength
    ? `${plainTextContent.substring(0, excerptLength)}...`
    : plainTextContent;
};

export const loadWebPostClass = (models: IModels) => {
  class WebPosts {
    public static getPosts = async (query: any, sort: any) => {
      return models.WebPosts.find(query).sort(sort).lean();
    };

    public static createPost = async (doc: IWebPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.WebPosts,
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

      return models.WebPosts.create(doc);
    };

    public static updatePost = async (_id: string, doc: IWebPost) => {
      if (!doc.slug && doc.title) {
        const baseSlug = slugify(doc.title, { lower: true });
        doc.slug = await generateUniqueSlug(
          models.WebPosts,
          doc.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      const post = await models.WebPosts.findOne({ _id });

      if (!post) {
        throw new Error('WebPost not found');
      }

      if (doc.content && !doc.excerpt && !post.excerpt) {
        doc.excerpt = prepareExcerpt(doc.content);
      }

      if (doc.status === 'published' && !post.publishedDate) {
        doc.publishedDate = new Date();
      }

      await models.WebPosts.updateOne({ _id }, { $set: { ...doc } });

      return models.WebPosts.findOne({ _id });
    };

    public static deletePost = async (_id: string) => {
      return models.WebPosts.findOneAndDelete({ _id });
    };

    public static changeStatus = async (
      _id: string,
      status: 'draft' | 'published' | 'archived' | 'scheduled',
    ) => {
      const post = await models.WebPosts.findOne({ _id });
      if (!post) {
        throw new Error('WebPost not found');
      }

      if (status === 'published' && !post.publishedDate) {
        post.publishedDate = new Date();
      }
      post.status = status;
      return post.save();
    };

    public static increaseViewCount = async (_id: string) => {
      return models.WebPosts.findOneAndUpdate(
        { _id },
        { $inc: { viewCount: 1 } },
        { new: true },
      );
    };

    public static toggleFeatured = async (_id: string) => {
      const post = await models.WebPosts.findOne({ _id });
      if (!post) {
        throw new Error('WebPost not found');
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

  webPostSchema.loadClass(WebPosts);

  return webPostSchema;
};

