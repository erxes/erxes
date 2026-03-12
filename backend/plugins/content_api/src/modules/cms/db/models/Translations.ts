import { Model } from 'mongoose';
import { ITranslation, ITranslationDocument } from '@/cms/@types/translations';
import { translationSchema } from '@/cms/db/definitions/translations';
import { IModels } from '~/connectionResolvers';

export interface ITranslationModel extends Model<ITranslationDocument> {
  createTranslation: (doc: ITranslation) => Promise<ITranslationDocument>;
  updateTranslation: (doc: ITranslation) => Promise<ITranslationDocument>;
  upsertTranslation: (doc: ITranslation) => Promise<ITranslationDocument>;
  deleteTranslation: (_id: string) => Promise<ITranslationDocument>;
}

export const loadTranslationClass = (models: IModels) => {
  class Translations {
    public static async createTranslation(doc: ITranslation) {
      return models.Translations.create(doc);
    }

    public static async upsertTranslation(
      doc: ITranslation,
    ): Promise<ITranslationDocument> {
      const { postId, language, type = 'post' } = doc;

      const result = await models.Translations.findOneAndUpdate(
        { postId, language, type },
        { $set: { ...doc, type } },
        { upsert: true, new: true },
      );

      return result!;
    }

    // kept for backward compat — delegates to upsert
    public static async updateTranslation(
      doc: ITranslation,
    ): Promise<ITranslationDocument> {
      return Translations.upsertTranslation(doc);
    }

    public static async deleteTranslation(_id: string) {
      return models.Translations.findByIdAndDelete(_id);
    }
  }

  translationSchema.loadClass(Translations);
  return translationSchema;
};
