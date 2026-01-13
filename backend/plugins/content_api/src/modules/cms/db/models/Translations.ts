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
      const {
        postId,
        language,
        title,
        content,
        excerpt,
        customFieldsData,
        type,
      } = doc;

      console.log('🔍 updateTranslation called with:', {
        postId,
        language,
        doc,
      });

      // Prepare only the fields that should be updated (exclude postId and language from $set)
      const updateFields: any = {
        title: title || '',
        content: content || '',
        excerpt: excerpt || '',
        type: type || 'post',
      };

      if (customFieldsData) {
        updateFields.customFieldsData = customFieldsData;
      }

      console.log('📝 Update fields prepared:', updateFields);

      // Find existing translation by postId and language
      const existing = await models.Translations.findOne({ postId, language });

      console.log(
        '🔎 Existing translation found:',
        existing ? existing._id : 'none',
      );

      if (existing) {
        // Update existing translation using $set operator
        const updated = await models.Translations.findByIdAndUpdate(
          existing._id,
          { $set: updateFields },
          {
            new: true,
            runValidators: true,
          },
        );

        console.log('✅ Translation updated:', updated);

        if (!updated) {
          console.error(
            '❌ Failed to update translation - findByIdAndUpdate returned null',
          );
          throw new Error('Failed to update translation');
        }

        return updated;
      }

      // Create new translation if not found
      console.log('➕ Creating new translation...');
      const translationData = {
        postId,
        language,
        ...updateFields,
      };
      const created = await models.Translations.create(translationData);
      console.log('✅ Translation created:', created);
      return created;
    }

    public static async deleteTranslation(_id: string) {
      return await models.Translations.findByIdAndDelete(_id);
    }
  }

  translationSchema.loadClass(Translations);

  return translationSchema;
};
