import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import {
  IOTATourAvailability,
  IOTATourAvailabilityDocument,
} from '@/ota/@types/tourAvailabilities';
import { otaTourAvailabilitySchema } from '@/ota/db/definitions/tourAvailabilities';

export interface ITourAvailabilityModel
  extends Model<IOTATourAvailabilityDocument> {
  createTourAvailability: (
    data: IOTATourAvailability,
  ) => Promise<IOTATourAvailabilityDocument>;
  updateTourAvailability: (
    id: string,
    data: Partial<IOTATourAvailability>,
  ) => Promise<IOTATourAvailabilityDocument | null>;
  deleteTourAvailability: (
    id: string,
  ) => Promise<IOTATourAvailabilityDocument | null>;
}

export const loadTourAvailabilityClass = (models: IModels) => {
  class TourAvailabilities {
    public static createTourAvailability = async (
      data: IOTATourAvailability,
    ) => {
      return models.TourAvailabilities.create(data);
    };

    public static updateTourAvailability = async (
      _id: string,
      data: Partial<IOTATourAvailability>,
    ) => {
      return models.TourAvailabilities.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    };

    public static deleteTourAvailability = async (_id: string) => {
      return models.TourAvailabilities.findOneAndDelete({ _id });
    };
  }

  otaTourAvailabilitySchema.loadClass(TourAvailabilities);
  return otaTourAvailabilitySchema;
};
