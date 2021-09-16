import { Model, model } from 'mongoose';

import {
  IBooking,
  IBookingDocument,
  bookingSchema
} from './definitions/bookings';
export interface IBookingModel extends Model<IBookingDocument> {
  getBooking(_id: string): Promise<IBookingDocument>;
  createDoc(fields: IBooking, userId?: string): Promise<IBookingDocument>;
  updateDoc(
    _id: string,
    fields: IBooking,
    userId?: string
  ): Promise<IBookingDocument>;
  removeDoc(_id: string): void;
}

export const loadBookingClass = () => {
  class Booking {
    /**
     * Get one booking
     */
    public static async getBooking(_id: string) {
      const booking = await Bookings.findOne({ _id });

      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    }

    /**
     * Create one booking
     */
    public static async createDoc(docFields: IBooking, userId?: string) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      const booking = await Bookings.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });

      return booking;
    }

    /**
     * Update one booking
     */
    public static async updateDoc(
      _id: string,
      docFields: IBooking,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      await Bookings.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      const booking = await Bookings.getBooking(_id);

      return booking;
    }

    /**
     * Remove booking
     */

    public static async removeDoc(_id: string) {
      return Bookings.deleteOne({ _id });
    }
  }

  bookingSchema.loadClass(Booking);

  return bookingSchema;
};

loadBookingClass();

// tslint:disable-next-line
export const Bookings = model<IBookingDocument, IBookingModel>(
  'bookings',
  bookingSchema
);
