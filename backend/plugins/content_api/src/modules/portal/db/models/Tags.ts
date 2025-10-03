import { Model } from 'mongoose';

import { IPostTag, IPostTagDocument } from '@/portal/@types/post';
import { postTagSchema } from '@/portal/db/definitions/post';
import slugify from 'slugify';
import { IModels } from '~/connectionResolvers';

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
      const slug = data.slug || slugify(data.name, { lower: true });
      data.slug = slug;
      return models.PostTags.create(data);
    };

    public static updateTag = async (id: string, data: IPostTag) => {
      if (!data.slug && data.name) {
        data.slug = slugify(data.name, { lower: true });
      }

      return models.PostTags.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true },
      );
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
