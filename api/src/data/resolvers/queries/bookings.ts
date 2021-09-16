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
    args: { page: number; perPage: number; brandId: string; tagId: string },
    { commonQuerySelector }: IContext
  ) {
    const filter: any = { ...commonQuerySelector };

    if (args.brandId) {
      filter.brandId = args.brandId;
    }

    if (args.tagId) {
      filter.tagIds = args.tagId;
    }

    const bookings = paginate(Bookings.find(filter), args);

    return bookings.sort({ modifiedDate: -1 });
  }
};

export default bookingQueries;
