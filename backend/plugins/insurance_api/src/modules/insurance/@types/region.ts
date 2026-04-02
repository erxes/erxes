import { Document } from 'mongoose';

export interface IRegion {
  name: string;
  countries: string[];
}

export interface IRegionDocument extends IRegion, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
