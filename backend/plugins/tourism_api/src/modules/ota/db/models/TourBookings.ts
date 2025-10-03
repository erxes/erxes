import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IOTATourBooking,
  IOTATourBookingDocument,
} from '@/ota/@types/tourBookings';
import { otaTourBookingSchema } from '@/ota/db/definitions/tourBookings';

export interface ITourBookingModel extends Model<IOTATourBookingDocument> {
  createTourBooking: (
    data: IOTATourBooking,
  ) => Promise<IOTATourBookingDocument>;
  cancelTourBooking: (id: string) => Promise<IOTATourBookingDocument | null>;
}

export const loadTourBookingClass = (models: IModels) => {
  class TourBookings {
    public static createTourBooking = async (data: IOTATourBooking) => {
      return models.TourBookings.create(data);
    };

    public static cancelTourBooking = async (_id: string) => {
      return models.TourBookings.findOneAndDelete({ _id });
    };
  }

  otaTourBookingSchema.loadClass(TourBookings);
  return otaTourBookingSchema;
};
