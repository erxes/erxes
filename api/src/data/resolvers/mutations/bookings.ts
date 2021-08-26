import { Bookings } from '../../../db/models';
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
  bookingsEdit(_root, { _id, ...doc }, { user, docModifier }: IContext) {
    return Bookings.updateDoc(_id, docModifier(doc), user._id);
  },

  /**
   * Remove booking
   */
  bookingsRemove(_root, { _id }) {
    return Bookings.removeDoc(_id);
  }
};

export default bookingMutations;
