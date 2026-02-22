import { Document } from 'mongoose';

export interface IKhanbankConfig {
  name: string;
  description?: string;

  // khanbank
  consumerKey: string;
  secretKey: string;
}

export interface IKhanbankConfigDocument extends IKhanbankConfig, Document {
  _id: string;
  createdAt: Date;
}
