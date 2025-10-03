import { Document } from 'mongoose';

interface IGuest {
  name: string;
  email: string;
  age: number;
  passportNumber?: string;
}

interface IRoom {
  roomTypeId: string;
  numberOfRooms: number;
  adults: number;
  children: number;
  price: number;
}

export interface IOTABooking {
  customerId: string;
  hotelId: string;
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  guests: IGuest[];
  totalPrice: number;
  status?: 'confirmed' | 'cancelled' | 'pending';
  externalBookingId?: string;
  rooms: IRoom[];
  total: number;
}

export interface IOTABookingDocument extends IOTABooking, Document {
  _id: string;
  createdAt: Date;
}
