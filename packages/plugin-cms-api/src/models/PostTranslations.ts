import { Model } from 'mongoose';

import {
  IPostTranslation,
  IPostTranslationDocument,
  postTranslationSchema,
} from './definitions/posts';
import { IModels } from '../connectionResolver';

export interface IPostTranslationModel extends Model<IPostTranslationDocument> {
  createPostTranslation: (
    doc: IPostTranslation
  ) => Promise<IPostTranslationDocument>;
  updatePostTranslation: (
    _id: string,
    doc: IPostTranslation
  ) => Promise<IPostTranslationDocument>;
  deletePostTranslation: (_id: string) => Promise<IPostTranslationDocument>;
}

export const loadPostTranslationClass = (models: IModels) => {
  class PostTranslations {
    public static async createPostTranslation(doc: IPostTranslation) {
      return await models.PostTranslations.create(doc);
    }

    public static async updatePostTranslation(
      _id: string,
      doc: IPostTranslation
    ) {
      return await models.PostTranslations.findByIdAndUpdate(_id, doc, {
        new: true,
      });
    }

    public static async deletePostTranslation(_id: string) {
      return await models.PostTranslations.findByIdAndDelete(_id);
    }
  }

  postTranslationSchema.loadClass(PostTranslations);

  return postTranslationSchema;
};

