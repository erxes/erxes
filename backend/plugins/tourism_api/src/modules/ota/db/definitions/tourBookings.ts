import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IOTATourBookingDocument } from '@/ota/@types/tourBookings';

export const otaTourBookingSchema = new Schema<IOTATourBookingDocument>({
  _id: mongooseStringRandomId,
  tourId: { type: String, required: true },
  customerId: { type: String, required: true },

  spots: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
  bookedAt: { type: Date, default: Date.now },
});
