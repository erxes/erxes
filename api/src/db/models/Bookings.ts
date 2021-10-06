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
  increaseViewCount(_id: string): void;
}

export const loadBookingClass = () => {
  class Booking {
    /**
     * Check duplication of main product category when create or edit booking
     * @param categoryId
     */
    static async checkCategoryDuplication(categoryId: string) {
      const category = await Bookings.findOne({
        productCategoryId: categoryId
      });

      if (category) {
        throw new Error(
          'Main product category already selected another booking!'
        );
      }
    }

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
      await this.checkCategoryDuplication(docFields.productCategoryId);

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
      const booking = await Bookings.getBooking(_id);

      if (docFields.productCategoryId !== booking.productCategoryId) {
        await this.checkCategoryDuplication(docFields.productCategoryId);
      }

      if (!userId) {
        throw new Error('User must be supplied');
      }

      await Bookings.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      return Bookings.findOne({ _id });
    }

    /**
     * Remove booking
     */

    public static async removeDoc(_id: string) {
      return Bookings.deleteOne({ _id });
    }

    public static async increaseViewCount(_id: string) {
      const response = await Bookings.updateOne(
        { _id },
        { $inc: { viewCount: 1 } }
      );
      return response;
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
