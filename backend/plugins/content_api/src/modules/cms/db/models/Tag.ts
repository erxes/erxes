import { Model } from 'mongoose';

import { IPostTag, IPostTagDocument } from '@/cms/@types/posts';
import { postTagSchema } from '@/cms/db/definitions/posts';
import slugify from 'slugify';
import { IModels } from '~/connectionResolvers';
import { generateUniqueSlug } from '@/cms/utils/common';

export interface IPostTagModel extends Model<IPostTagDocument> {
  getPostTags: (query: any) => Promise<IPostTagDocument[]>;
  createTag: (data: IPostTag) => Promise<IPostTagDocument>;
  updateTag: (id: string, data: IPostTag) => Promise<IPostTagDocument>;
  deleteTag: (id: string) => Promise<IPostTagDocument>;
  toggleStatus: (id: string) => Promise<IPostTagDocument>;
}

export const loadPostTagClass = (models: IModels) => {
  class PostTags {
    public static createTag = async (data: IPostTag) => {
      const baseSlug = data.slug || slugify(data.name, { lower: true });

      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug(
        models.PostTags,
        data.clientPortalId,
        'slug',
        baseSlug,
      );
      data.slug = uniqueSlug;

      try {
        const tag = await models.PostTags.create(data);
        return tag;
      } catch (error: any) {
        // Fallback: if create still fails (race condition), retry with new slug
        if (error.code === 11000 && error.keyPattern?.slug) {
          const fallbackSlug = await generateUniqueSlug(
            models.PostTags,
            data.clientPortalId,
            'slug',
            baseSlug,
            2,
          );
          data.slug = fallbackSlug;
          return await models.PostTags.create(data);
        }
        throw error;
      }
    };

    public static updateTag = async (id: string, data: IPostTag) => {
      if (data.name) {
        const baseSlug = slugify(data.name, { lower: true });
        // Generate unique slug excluding current document
        data.slug = await generateUniqueSlug(
          models.PostTags,
          data.clientPortalId,
          'slug',
          baseSlug,
        );
      }

      const tag = await models.PostTags.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true },
      );
      return tag;
    };

    public static deleteTag = async (id: string) => {
      return models.PostTags.findOneAndDelete({ _id: id });
    };

    public static getPostTags = async (query: any) => {
      const categories = await models.PostTags.find(query)
        .sort({ name: 1 })
        .lean();

      return categories;
    };
  }
  postTagSchema.loadClass(PostTags);

  return postTagSchema;
};
