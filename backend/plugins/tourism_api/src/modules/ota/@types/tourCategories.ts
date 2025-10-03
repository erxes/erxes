import { Document } from 'mongoose';

export interface IOTATourCategory {
  name: string;
  description?: string;
  slug?: string;
}

export interface IOTATourCategoryDocument extends IOTATourCategory, Document {
  _id: string;
}
