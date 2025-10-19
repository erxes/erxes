import { Document } from 'mongoose';

export interface IVoucher {
  name?: string;
}

export interface IVoucherDocument extends IVoucher, Document {
  createdAt: Date;
  updatedAt: Date;
}
