import { Bookings } from '../../../db/models';

const bookingQueries = {
  /**
   * Booking detail
   */
  bookingDetail(_root, { _id }: { _id: string }) {
    return Bookings.getBooking(_id);
  }
};

export default bookingQueries;
