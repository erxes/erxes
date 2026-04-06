import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ITourCategoryTranslation,
  ITourCategoryTranslationDocument,
} from '@/bms/@types/tourCategoryTranslation';
import { tourCategoryTranslationSchema } from '@/bms/db/definitions/tourCategoryTranslation';

export interface ITourCategoryTranslationModel
  extends Model<ITourCategoryTranslationDocument> {
  upsertTranslation(
    doc: ITourCategoryTranslation,
  ): Promise<ITourCategoryTranslationDocument>;
  deleteTranslation(
    _id: string,
  ): Promise<ITourCategoryTranslationDocument | null>;
  deleteTranslationsForObject(objectId: string): Promise<void>;
}

export const loadTourCategoryTranslationClass = (models: IModels) => {
  class TourCategoryTranslations {
    public static async upsertTranslation(
      doc: ITourCategoryTranslation,
    ): Promise<ITourCategoryTranslationDocument> {
      const { objectId, language, ...rest } = doc;

      const result = await models.TourCategoryTranslations.findOneAndUpdate(
        { objectId, language },
        { $set: { ...rest, objectId, language } },
        { upsert: true, new: true },
      );

      return result!;
    }

    public static async deleteTranslation(
      _id: string,
    ): Promise<ITourCategoryTranslationDocument | null> {
      return models.TourCategoryTranslations.findByIdAndDelete(_id);
    }

    public static async deleteTranslationsForObject(
      objectId: string,
    ): Promise<void> {
      await models.TourCategoryTranslations.deleteMany({ objectId });
    }
  }

  tourCategoryTranslationSchema.loadClass(TourCategoryTranslations);
  return tourCategoryTranslationSchema;
};