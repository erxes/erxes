import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IAvailabilityDocument } from '@/ota/@types/availabilities';

export const availabilitySchema = new Schema<IAvailabilityDocument>(
  {
    _id: mongooseStringRandomId,
    roomTypeId: { type: String, required: true }, // Foreign key for the room type
    date: { type: String, required: true }, // The date for the availability
    availableRooms: { type: Number, required: true }, // Available rooms on this date
    price: { type: Number, required: true }, // Price of the room for this date
  },
  { timestamps: true },
);

availabilitySchema.index({ roomTypeId: 1, date: 1 }, { unique: true });
