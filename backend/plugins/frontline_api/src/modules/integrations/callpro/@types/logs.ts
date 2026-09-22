import { Document } from 'mongoose';

export interface ICallProLog {
  type: string;
  value: Record<string, unknown>;
  specialValue: string;
  createdAt: Date;
}

export interface ICallProLogDocument extends ICallProLog, Document {
  _id: string;
}
