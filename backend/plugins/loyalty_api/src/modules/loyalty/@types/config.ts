import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ILoyaltyConfig {
  code: string;
  value: any;
}

export interface ILoyaltyConfigDocument extends ILoyaltyConfig, Document {
  _id: string;
}
