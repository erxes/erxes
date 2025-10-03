import { Document } from 'mongoose';

export interface IAvailability {
  roomTypeId: string; // Reference to the room type
  date: string; // The date for the availability
  availableRooms: number; // Number of rooms available on that date
  price: number; // Price for the room on that date
}

export interface IAvailabilityDocument extends IAvailability, Document {
  _id: string;
  createdAt: Date;
}
