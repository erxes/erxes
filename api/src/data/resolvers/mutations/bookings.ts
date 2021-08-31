import {
  Bookings,
  BookingFloors as Floors,
  BookingCards as Cards
} from '../../../db/models';
import { IBooking } from '../../../db/models/definitions/bookings';
import { IContext } from '../../types';

const bookingMutations = {
  /**
   * Create new booking
   */
  bookingsAdd(_root, doc: IBooking, { user }: IContext) {
    return Bookings.createDoc(doc, user._id);
  },

  /**
   * Edit booking
   */
  bookingsEdit(_root, { _id, ...doc }, { user }: IContext) {
    return Bookings.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove booking
   */
  bookingsRemove(_root, { _id }) {
    return Bookings.removeDoc(_id);
  },

  /**
   * Create new floor
   */
  floorsAdd(_root, doc, { user }: IContext) {
    return Floors.createDoc(doc, user._id);
  },

  /**
   * Edit floor
   */
  floorsEdit(_root, { _id, ...doc }, { user }: IContext) {
    return Floors.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove floors
   */
  floorsRemove(_root, { _id }) {
    return Floors.removeDoc(_id);
  },

  /**
   * Create new card
   */
  cardsAdd(_root, doc, { user }: IContext) {
    return Cards.createDoc(doc, user._id);
  },

  /**
   * Edit card
   */
  cardsEdit(_root, { _id, ...doc }, { user }: IContext) {
    return Cards.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove card
   */
  cardsRemove(_root, { _id }) {
    return Cards.removeDoc(_id);
  }
};

export default bookingMutations;
