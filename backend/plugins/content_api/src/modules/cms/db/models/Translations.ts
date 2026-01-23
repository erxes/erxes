import { Model } from 'mongoose';

import { ITranslation, ITranslationDocument } from '@/cms/@types/translations';
import { translationSchema } from '@/cms/db/definitions/translations';
import { IModels } from '~/connectionResolvers';

export interface ITranslationModel extends Model<ITranslationDocument> {
  createTranslation: (doc: ITranslation) => Promise<ITranslationDocument>;
  updateTranslation: (doc: ITranslation) => Promise<ITranslationDocument>;
  deleteTranslation: (_id: string) => Promise<ITranslationDocument>;
}

export const loadTranslationClass = (models: IModels) => {
  class Translations {
    public static async createTranslation(doc: ITranslation) {
      return await models.Translations.create(doc);
    }

    public static async updateTranslation(doc: ITranslation) {
      const { postId, language } = doc;

      // Find existing translation by postId and language
      const existing = await models.Translations.findOne({ postId, language });

      if (existing) {
        // Update existing translation
        return await models.Translations.findByIdAndUpdate(existing._id, doc, {
          new: true,
        });
      }

      // Create new translation if not found
      return await models.Translations.create(doc);
    }

    public static async deleteTranslation(_id: string) {
      return await models.Translations.findByIdAndDelete(_id);
    }
  }

  translationSchema.loadClass(Translations);

  return translationSchema;
};
