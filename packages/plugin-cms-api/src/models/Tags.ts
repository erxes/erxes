import { Model } from 'mongoose';
import { IPostTag, IPostTagDocument, postTagSchema } from './definitions/tags';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';
import { generateUniqueSlug, generateUniqueSlugWithExclusion } from './utils';

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
        'slug',
        baseSlug
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
            'slug',
            baseSlug,
            2
          );
          data.slug = fallbackSlug;
          return await models.PostTags.create(data);
        }
        throw error;
      }
    };

    public static updateTag = async (id: string, data: IPostTag) => {
      if (!data.slug && data.name) {
        const baseSlug = slugify(data.name, { lower: true });
        // Generate unique slug excluding current document
        data.slug = await generateUniqueSlugWithExclusion(
          models.PostTags,
          'slug',
          baseSlug,
          id
        );
      } else if (data.slug) {
        // If slug is provided, ensure it's unique excluding current document
        data.slug = await generateUniqueSlugWithExclusion(
          models.PostTags,
          'slug',
          data.slug,
          id
        );
      }

      const tag = await models.PostTags.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      );
      return tag;
    };

    public static deleteTag = async (id: string) => {
      const tag = await models.PostTags.findOneAndDelete({ _id: id });
      return tag;
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
