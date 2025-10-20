import { Document } from 'mongoose';

export interface IDonate {
  name?: string;
}

export interface IDonateDocument extends IDonate, Document {
  createdAt: Date;
  updatedAt: Date;
}
