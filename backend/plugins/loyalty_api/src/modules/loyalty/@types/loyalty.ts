import { Document } from 'mongoose';

export interface ILoyalty {
  name?: string;
}

export interface ILoyaltyDocument extends ILoyalty, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
