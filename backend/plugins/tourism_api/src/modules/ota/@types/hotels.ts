import { Document } from 'mongoose';

export interface IOTALocation {
  country?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface IPolicy {
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
}

export interface IOTAHotel {
  saasOrgId: string;
  externalHotelId?: string;
  name: string;
  description?: string;
  location?: IOTALocation;
  amenities?: string[];
  photos?: string[];
  isPublished?: boolean;
  policy: IPolicy;

  visits?: number;
}

export interface IOTAHotelDocument extends IOTAHotel, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
