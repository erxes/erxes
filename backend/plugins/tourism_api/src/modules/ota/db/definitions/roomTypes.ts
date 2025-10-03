import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IOTARoomTypeDocument } from '@/ota/@types/roomTypes';

export const otaRoomTypeSchema = new Schema<IOTARoomTypeDocument>(
  {
    _id: mongooseStringRandomId,
    hotelId: { type: String, required: true },
    externalRoomTypeId: String,
    name: { type: String, required: true },
    description: String,
    capacity: Number,
    price: { type: Number, required: true },
    photos: [String],
    isAvailable: { type: Boolean, default: true },
    isSmoking: { type: Boolean, default: false },
    isPetsAllowed: { type: Boolean, default: false },
    isWheelchairAccessible: { type: Boolean, default: false },
    isKidsFree: { type: Boolean, default: false },
    size: { type: String, enum: ['small', 'medium', 'large', 'suite'] },
    amenities: [String],
    bedType: {
      type: String,
      enum: ['single', 'double', 'queen', 'king', 'twin'],
    },
  },
  { timestamps: true },
);

otaRoomTypeSchema.index({ hotelId: 1 });
