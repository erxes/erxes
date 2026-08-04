import { Document } from 'mongoose';

export interface IInstagramConfig {
  code: string;
  value: any;
}

export interface IInstagramConfigDocument extends IInstagramConfig, Document {
  _id: string;
}
