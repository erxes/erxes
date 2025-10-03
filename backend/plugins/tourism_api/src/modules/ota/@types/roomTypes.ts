import { Document } from 'mongoose';

export interface IOTARoomType {
  hotelId: string;
  externalRoomTypeId?: string;
  name: string;
  description?: string;
  capacity?: number;
  price?: number;
  photos?: string[];
  isAvailable?: boolean;
  isSmoking?: boolean;
  isPetsAllowed?: boolean;
  isWheelchairAccessible?: boolean;
  isKidsFree?: boolean;
  size?: string;
  amenities?: string[];
  bedType?: string;
}

export interface IOTARoomTypeDocument extends IOTARoomType, Document {
  _id: string;
  createdAt: Date;
}
