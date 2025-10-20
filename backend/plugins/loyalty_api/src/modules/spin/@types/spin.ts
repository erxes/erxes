import { Document } from 'mongoose';

export interface ISpin {
  name?: string;
}

export interface ISpinDocument extends ISpin, Document {
  createdAt: Date;
  updatedAt: Date;
}
