import { Document } from 'mongoose';

export interface IRiskType {
  name: string;
  description?: string;
}

export interface IRiskTypeDocument extends IRiskType, Document {
  _id: string;
}
