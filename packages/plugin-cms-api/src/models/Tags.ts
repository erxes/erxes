import { Model } from 'mongoose';
import {
  IPostTag,
  IPostTagDocument,
  postTagSchema,
} from './definitions/tags';
import { IModels } from '../connectionResolver';
import slugify from 'slugify';

export interface IPostTagModel extends Model<IPostTagDocument> {
  getPostTags: (query: any) => Promise<IPostTagDocument[]>;
  createTag: (data: IPostTag) => Promise<IPostTagDocument>;
  updateTag: (
    id: string,
    data: IPostTag
  ) => Promise<IPostTagDocument>;
  deleteTag: (id: string) => Promise<IPostTagDocument>;
  toggleStatus: (id: string) => Promise<IPostTagDocument>;
}

export const loadPostTagClass = (models: IModels) => {
  class PostTags {
    /**
     * Generate unique slug by recursively adding increment number
     */
    private static generateUniqueSlug = async (
      baseSlug: string, 
      count: number = 1
    ): Promise<string> => {
      const potentialSlug = count === 1 ? baseSlug : `${baseSlug}-${count}`;
      
      // Check if slug already exists
      const existingTag = await models.PostTags.findOne({ slug: potentialSlug });
      
      if (!existingTag) {
        return potentialSlug;
      }
      
      // If slug exists, try with next increment number
      return this.generateUniqueSlug(baseSlug, count + 1);
    };

    public static createTag = async (data: IPostTag) => {
      const baseSlug = data.slug || slugify(data.name, { lower: true });
      
      // Generate unique slug
      const uniqueSlug = await this.generateUniqueSlug(baseSlug);
      data.slug = uniqueSlug;
      
      try {
        const tag = await models.PostTags.create(data);
        return tag;
      } catch (error: any) {
        // Fallback: if create still fails (race condition), retry with new slug
        if (error.code === 11000 && error.keyPattern?.slug) {
          const fallbackSlug = await this.generateUniqueSlug(baseSlug, 2);
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
        data.slug = await this.generateUniqueSlugWithExclusion(baseSlug, id);
      } else if (data.slug) {
        // If slug is provided, ensure it's unique excluding current document
        data.slug = await this.generateUniqueSlugWithExclusion(data.slug, id);
      }

      const tag = await models.PostTags.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      );
      return tag;
    };

    /**
     * Generate unique slug excluding a specific document (for updates)
     */
    private static generateUniqueSlugWithExclusion = async (
      baseSlug: string, 
      excludeId: string,
      count: number = 1
    ): Promise<string> => {
      const potentialSlug = count === 1 ? baseSlug : `${baseSlug}-${count}`;
      
      // Check if slug already exists excluding current document
      const existingTag = await models.PostTags.findOne({
        slug: potentialSlug,
        _id: { $ne: excludeId }
      });
      
      if (!existingTag) {
        return potentialSlug;
      }
      
      // If slug exists, try with next increment number
      return this.generateUniqueSlugWithExclusion(baseSlug, excludeId, count + 1);
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