import { Model, model } from 'mongoose';

import {
  IBooking,
  IBookingDocument,
  bookingSchema,
  ICard,
  ICardDocument,
  cardSchema
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
        createdUser: userId,
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

export interface ICardModel extends Model<ICardDocument> {
  getCard(_id: string): Promise<ICardDocument>;
  createDoc(docFields: ICard, userId?: string): Promise<ICardDocument>;
  updateDoc(
    _id: string,
    docFields: ICard,
    userId?: string
  ): Promise<ICardDocument>;
  removeDoc(_id: string): void;
}

export const loadCardClass = () => {
  class Card {
    /**
     * Get one card
     */
    public static async getCard(_id: string) {
      const card = await Cards.findOne({ _id });

      if (!card) {
        throw new Error('Booking not found');
      }

      return card;
    }

    /**
     * create card
     */
    public static async createDoc(docFields: ICard, userId?: string) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      const card = await Cards.create({
        ...docFields,
        createdDate: new Date(),
        createdUser: userId,
        modifiedDate: new Date()
      });

      return card;
    }

    /**
     * update one card
     */
    public static async updateDoc(
      _id: string,
      docFields: ICard,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      await Cards.updateOne(
        { _id },
        { $set: { ...docFields, modifiedBy: userId, modifiedDate: new Date() } }
      );

      const card = await Cards.getCard(_id);

      return card;
    }

    /**
     * Remove one card
     */
    public static async removDoc(_id: string) {
      return Cards.deleteOne({ _id });
    }
  }

  cardSchema.loadClass(Card);

  return cardSchema;
};

loadBookingClass();
loadCardClass();

// tslint:disable-next-line
export const Bookings = model<IBookingDocument, IBookingModel>(
  'bookings',
  bookingSchema
);

export const Cards = model<ICardDocument, ICardModel>(
  'booking_cards',
  cardSchema
);
