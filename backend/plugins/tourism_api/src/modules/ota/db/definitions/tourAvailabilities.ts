import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IOTATourAvailabilityDocument } from '@/ota/@types/tourAvailabilities';

export const otaTourAvailabilitySchema =
  new Schema<IOTATourAvailabilityDocument>({
    _id: mongooseStringRandomId,
    tourId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalSpots: { type: Number, required: true },
    availableSpots: { type: Number, required: true },
    price: Number,
  });
