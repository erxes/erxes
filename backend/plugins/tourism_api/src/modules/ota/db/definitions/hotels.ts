import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IOTAHotelDocument, IOTALocation } from '@/ota/@types/hotels';

const locationSchema = new Schema<IOTALocation>(
  {
    country: String,
    city: String,
    address: String,
    lat: Number,
    lng: Number,
  },
  { _id: false },
);

export const otaHotelSchema = new Schema<IOTAHotelDocument>(
  {
    _id: mongooseStringRandomId,
    saasOrgId: { type: String, required: true },
    externalHotelId: String,
    name: { type: String, required: true },
    description: String,
    location: locationSchema,
    amenities: [String],
    photos: [String],
    isPublished: { type: Boolean, default: false },
    policy: {
      checkIn: String,
      checkOut: String,
      cancellationPolicy: String,
    },
    visits: { type: Number, default: 0 },
  },
  { timestamps: true },
);

otaHotelSchema.index({ saasOrgId: 1, externalHotelId: 1 });
