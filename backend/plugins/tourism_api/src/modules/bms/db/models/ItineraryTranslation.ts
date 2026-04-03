import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IItineraryTranslation,
  IItineraryTranslationDocument,
} from '@/bms/@types/itineraryTranslation';
import { itineraryTranslationSchema } from '@/bms/db/definitions/itineraryTranslation';

export interface IItineraryTranslationModel
  extends Model<IItineraryTranslationDocument> {
  upsertTranslation(
    doc: IItineraryTranslation,
  ): Promise<IItineraryTranslationDocument>;
  deleteTranslation(_id: string): Promise<IItineraryTranslationDocument | null>;
  deleteTranslationsForObject(objectId: string): Promise<void>;
}

export const loadItineraryTranslationClass = (models: IModels) => {
  class ItineraryTranslations {
    public static async upsertTranslation(
      doc: IItineraryTranslation,
    ): Promise<IItineraryTranslationDocument> {
      const { objectId, language, ...rest } = doc;

      const result = await models.ItineraryTranslations.findOneAndUpdate(
        { objectId, language },
        { $set: { ...rest, objectId, language } },
        { upsert: true, new: true },
      );

      return result!;
    }

    public static async deleteTranslation(
      _id: string,
    ): Promise<IItineraryTranslationDocument | null> {
      return models.ItineraryTranslations.findByIdAndDelete(_id);
    }

    public static async deleteTranslationsForObject(
      objectId: string,
    ): Promise<void> {
      await models.ItineraryTranslations.deleteMany({ objectId });
    }
  }

  itineraryTranslationSchema.loadClass(ItineraryTranslations);
  return itineraryTranslationSchema;
};