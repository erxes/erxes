import { Document } from 'mongoose';

export interface IUom {
  code: string;
  name: string;
  timely?: string;
}

export interface IUomDocument extends IUom, Document {
  _id: string;
  createdAt: Date;
}
