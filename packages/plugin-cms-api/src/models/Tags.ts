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
    public static createTag = async (data: IPostTag) => {
      const slug = data.slug || slugify(data.name, { lower: true });
      data.slug = slug;
      const tag = await models.PostTags.create(data);
      return tag;
    };

    public static updateTag = async (id: string, data: IPostTag) => {
      if (!data.slug && data.name) {
        data.slug = slugify(data.name, { lower: true });
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
