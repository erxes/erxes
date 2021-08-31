import { Model, model } from 'mongoose';

import {
  IBooking,
  IBookingDocument,
  bookingSchema,
  ICard,
  ICardDocument,
  cardSchema,
  IFloorDocument,
  IFloor,
  floorSchema
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

export interface IFloorModel extends Model<IFloorDocument> {
  getFloor(_id: string): Promise<IFloorDocument>;
  createDoc(docFields: IFloor, userId?: string): Promise<IFloorDocument>;
  updateDoc(
    _id: string,
    docFields: IFloor,
    userId?: string
  ): Promise<IFloorDocument>;
  removeDoc(_id: string): void;
}

export const loadFloorClass = () => {
  class Floor {
    /**
     * Get one floor
     */
    public static async getFloor(_id) {
      const floor = await Floors.findOne({ _id });

      if (!floor) {
        throw new Error('Floor not found');
      }

      return floor;
    }

    /**
     * Create floor
     */
    public static async createDoc(docFields: IFloor, userId?: string) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      const floor = await Floors.create({
        ...docFields,
        createdDate: new Date(),
        createdUser: userId,
        modifiedDate: new Date()
      });

      return floor;
    }

    /**
     * Update floor
     */
    public static async updateDoc(
      _id: string,
      docFields: IFloor,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('User must be supplied');
      }

      await Floors.updateOne(
        { _id },
        { $set: { ...docFields, modifiedDate: new Date(), modifiedBy: userId } }
      );

      return Floors.getFloor(_id);
    }

    /**
     * Remove floor
     */
    public static async removeDoc(_id) {
      return Floors.deleteOne({ _id });
    }
  }

  floorSchema.loadClass(Floor);

  return floorSchema;
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
        throw new Error('Card not found');
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
    public static async removeDoc(_id: string) {
      return Cards.deleteOne({ _id });
    }
  }

  cardSchema.loadClass(Card);

  return cardSchema;
};

loadBookingClass();
loadFloorClass();
loadCardClass();

// tslint:disable-next-line
export const Bookings = model<IBookingDocument, IBookingModel>(
  'bookings',
  bookingSchema
);

export const Floors = model<IFloorDocument, IFloorModel>(
  'booking_floors',
  floorSchema
);

export const Cards = model<ICardDocument, ICardModel>(
  'booking_cards',
  cardSchema
);
