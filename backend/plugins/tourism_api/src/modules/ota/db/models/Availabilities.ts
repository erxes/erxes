// Availabilities.ts
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IAvailability,
  IAvailabilityDocument,
} from '@/ota/@types/availabilities';
import { availabilitySchema } from '@/ota/db/definitions/availabilities';

export interface IAvailabilityModel extends Model<IAvailabilityDocument> {
  createAvailability: (data: IAvailability) => Promise<IAvailabilityDocument>;
  updateAvailability: (
    id: string,
    data: Partial<IAvailability>,
  ) => Promise<IAvailabilityDocument | null>;
  deleteAvailability: (id: string) => Promise<IAvailabilityDocument | null>;
}

export const loadAvailabilityClass = (models: IModels) => {
  class Availabilities {
    public static createAvailability = async (data: IAvailability) => {
      return models.Availabilities.create(data);
    };

    public static updateAvailability = async (
      _id: string,
      data: Partial<IAvailability>,
    ) => {
      return models.Availabilities.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    };

    public static deleteAvailability = async (_id: string) => {
      return models.Availabilities.findOneAndDelete({ _id });
    };
  }

  availabilitySchema.loadClass(Availabilities);
  return availabilitySchema;
};
