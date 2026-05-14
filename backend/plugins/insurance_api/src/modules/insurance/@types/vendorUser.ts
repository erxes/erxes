import { Document } from 'mongoose';

export interface IVendorUser {
  name?: string;
  email: string;
  phone?: string;
  password: string;
  vendor: string;
  role: 'user' | 'admin' | 'manager';
}

export interface IVendorUserDocument extends IVendorUser, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
