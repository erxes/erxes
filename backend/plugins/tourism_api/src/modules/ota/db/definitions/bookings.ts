import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IOTABookingDocument } from '@/ota/@types/bookings';

export const otaBookingSchema = new Schema<IOTABookingDocument>(
  {
    _id: mongooseStringRandomId,
    customerId: { type: String, required: true },
    hotelId: { type: String, required: true },
    rooms: [
      {
        roomTypeId: String,
        numberOfRooms: Number,
        adults: Number,
        children: Number,
        price: Number,
      },
    ],
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: [
      { name: String, email: String, age: Number, passportNumber: String },
    ],
    totalPrice: Number,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed',
    },
    total: Number,
    externalBookingId: String,
  },
  { timestamps: true },
);

otaBookingSchema.index({ hotelId: 1 });
