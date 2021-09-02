import { Bookings } from '../../../db/models';
import { paginate } from '../../utils';
import { IContext } from '../../types';

const bookingQueries = {
  /**
   * Booking detail
   */
  bookingDetail(_root, { _id }: { _id: string }) {
    return Bookings.getBooking(_id);
  },

  /**
   * Booking list
   */
  bookings(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    const bookings = paginate(Bookings.find(commonQuerySelector), args);

    return bookings.sort({ modifiedDate: -1 });
  }
};

export default bookingQueries;
