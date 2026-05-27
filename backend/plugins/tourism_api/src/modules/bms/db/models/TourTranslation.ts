import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ITourTranslation,
  ITourTranslationDocument,
} from '@/bms/@types/tourTranslation';
import { tourTranslationSchema } from '@/bms/db/definitions/tourTranslation';

export interface ITourTranslationModel extends Model<ITourTranslationDocument> {
  upsertTranslation(doc: ITourTranslation): Promise<ITourTranslationDocument>;
  deleteTranslation(_id: string): Promise<ITourTranslationDocument | null>;
  deleteTranslationsForObject(objectId: string): Promise<void>;
}

export const loadTourTranslationClass = (models: IModels) => {
  class TourTranslations {
    public static async upsertTranslation(
      doc: ITourTranslation,
    ): Promise<ITourTranslationDocument> {
      const { objectId, language, ...rest } = doc;

      const result = await models.TourTranslations.findOneAndUpdate(
        { objectId, language },
        { $set: { ...rest, objectId, language } },
        { upsert: true, new: true },
      );

      return result!;
    }

    public static async deleteTranslation(
      _id: string,
    ): Promise<ITourTranslationDocument | null> {
      return models.TourTranslations.findByIdAndDelete(_id);
    }

    public static async deleteTranslationsForObject(
      objectId: string,
    ): Promise<void> {
      await models.TourTranslations.deleteMany({ objectId });
    }
  }

  tourTranslationSchema.loadClass(TourTranslations);
  return tourTranslationSchema;
};
