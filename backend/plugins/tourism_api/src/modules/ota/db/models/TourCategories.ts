import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IOTATourCategory,
  IOTATourCategoryDocument,
} from '@/ota/@types/tourCategories';
import { otaTourCategorySchema } from '@/ota/db/definitions/tourCategories';

export interface ITourCategoryModel extends Model<IOTATourCategoryDocument> {
  createTourCategory: (
    data: IOTATourCategory,
  ) => Promise<IOTATourCategoryDocument>;
  updateTourCategory: (
    id: string,
    data: Partial<IOTATourCategory>,
  ) => Promise<IOTATourCategoryDocument | null>;
  deleteTourCategory: (id: string) => Promise<IOTATourCategoryDocument | null>;
}

export const loadTourCategoryClass = (models: IModels) => {
  class TourCategories {
    public static createTourCategory = async (data: IOTATourCategory) => {
      return models.TourCategories.create(data);
    };

    public static updateTourCategory = async (
      _id: string,
      data: Partial<IOTATourCategory>,
    ) => {
      return models.TourCategories.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    };

    public static deleteTourCategory = async (_id: string) => {
      return models.TourCategories.findOneAndDelete({ _id });
    };
  }

  otaTourCategorySchema.loadClass(TourCategories);
  return otaTourCategorySchema;
};
