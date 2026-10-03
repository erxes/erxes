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
      const { objectId, language, type = 'post' } = doc;

      try {
        const result = await models.Translations.findOneAndUpdate(
          { objectId, language, type },
          { $set: { ...doc, type } },
          { upsert: true, new: true },
        );

        return result!;
      } catch (error: any) {
        // Auto-fix duplicate key error
        if (
          error.code === 11000 &&
          error.message.includes('cms_translations')
        ) {
          console.log('🔧 Auto-fixing translation index issue in model...');

          // Fix the index issue
          await Translations.fixTranslationIndex(models);

          // Retry the operation
          const result = await models.Translations.findOneAndUpdate(
            { objectId, language, type },
            { $set: { ...doc, type } },
            { upsert: true, new: true },
          );

          console.log('✅ Translation model auto-fix completed');
          return result!;
        }

        throw error;
      }
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

    public static async fixTranslationIndex(models: IModels) {
      const db = models.Translations.db;
      const translationsCollection = db.collection('cms_translations');

      try {
        // Drop old index if exists
        await translationsCollection
          .dropIndex('postId_1_language_1_type_1')
          .catch(() => {});

        // Clean up null objectId documents
        await translationsCollection.deleteMany({ objectId: null });

        // Create correct index
        await translationsCollection
          .createIndex(
            { objectId: 1, language: 1, type: 1 },
            { unique: true, name: 'objectId_1_language_1_type_1' },
          )
          .catch(() => {}); // Index might already exist

        console.log('🔧 Translation index auto-fix completed in model');
      } catch (error) {
        console.error('❌ Auto-fix failed in model:', error);
      }
    }
  }

  translationSchema.loadClass(Translations);
  return translationSchema;
};
