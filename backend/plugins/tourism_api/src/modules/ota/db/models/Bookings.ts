import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';

import { IOTABooking, IOTABookingDocument } from '@/ota/@types/bookings';
import { otaBookingSchema } from '@/ota/db/definitions/bookings';

export interface IBookingModel extends Model<IOTABookingDocument> {
  createBooking: (data: IOTABooking) => Promise<IOTABookingDocument>;
  cancelBooking: (id: string) => Promise<IOTABookingDocument | null>;
}

export const loadBookingClass = (models: IModels) => {
  class Bookings {
    public static createBooking = async (data: IOTABooking) => {
      return models.Bookings.create(data);
    };

    public static cancelBooking = async (_id: string) => {
      return models.Bookings.findOneAndUpdate({ _id }, { status: 'cancelled' });
    };
  }

  otaBookingSchema.loadClass(Bookings);
  return otaBookingSchema;
};
