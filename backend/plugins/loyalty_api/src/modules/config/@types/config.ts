import { Document } from 'mongoose';

export interface ILoyaltyConfig {
  code: string;
  value: any;
}

export interface ILoyaltyConfigDocument extends ILoyaltyConfig, Document {
  _id: string;
}