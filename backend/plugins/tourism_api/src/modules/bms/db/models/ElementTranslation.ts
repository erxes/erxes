import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IElementTranslation,
  IElementTranslationDocument,
} from '@/bms/@types/elementTranslation';
import { elementTranslationSchema } from '@/bms/db/definitions/elementTranslation';

export interface IElementTranslationModel
  extends Model<IElementTranslationDocument> {
  upsertTranslation(
    doc: IElementTranslation,
  ): Promise<IElementTranslationDocument>;
  deleteTranslation(_id: string): Promise<IElementTranslationDocument | null>;
  deleteTranslationsForObject(objectId: string): Promise<void>;
}

export const loadElementTranslationClass = (models: IModels) => {
  class ElementTranslations {
    /**
     * Create or update a translation for an element.
     * Uniqueness is enforced on (objectId, language).
     */
    public static async upsertTranslation(
      doc: IElementTranslation,
    ): Promise<IElementTranslationDocument> {
      const { objectId, language, ...rest } = doc;

      const result = await models.ElementTranslations.findOneAndUpdate(
        { objectId, language },
        { $set: { ...rest, objectId, language } },
        { upsert: true, new: true },
      );

      return result!;
    }

    public static async deleteTranslation(
      _id: string,
    ): Promise<IElementTranslationDocument | null> {
      return models.ElementTranslations.findByIdAndDelete(_id);
    }

    public static async deleteTranslationsForObject(
      objectId: string,
    ): Promise<void> {
      await models.ElementTranslations.deleteMany({ objectId });
    }
  }

  elementTranslationSchema.loadClass(ElementTranslations);
  return elementTranslationSchema;
};