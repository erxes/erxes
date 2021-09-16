import { IBookingDocument } from '../../db/models/definitions/bookings';
import { Brands, Users, Tags } from '../../db/models';

export default {
  brand(booking: IBookingDocument) {
    return Brands.findOne({ _id: booking.brandId });
  },

  createdUser(booking: IBookingDocument) {
    return Users.findOne({ _id: booking.createdBy });
  },

  tags(booking: IBookingDocument) {
    return Tags.find({ _id: booking.tagIds });
  }
};
