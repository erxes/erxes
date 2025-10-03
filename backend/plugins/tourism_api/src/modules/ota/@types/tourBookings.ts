import { Document } from 'mongoose';

export interface IOTATourBooking {
  tourId: string;
  customerId: string;

  spots: number;
  status: 'confirmed' | 'cancelled';
  bookedAt?: Date;
}

export interface IOTATourBookingDocument extends IOTATourBooking, Document {
  _id: string;
}
