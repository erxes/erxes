import { Document } from 'mongoose';

export interface IOTATourAvailability {
  tourId: string;
  startDate: Date;
  endDate: Date;
  totalSpots: number;
  availableSpots: number;
  price?: number;
}

export interface IOTATourAvailabilityDocument
  extends IOTATourAvailability,
    Document {
  _id: string;
}
