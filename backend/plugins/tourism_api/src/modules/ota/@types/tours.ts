import { Document } from 'mongoose';

export interface IOTATour {
  title: string;
  description?: string;
  price: number;
  categoryId?: string;
  duration?: string;
  images?: string[];
  isPublished?: boolean;
  createdAt?: Date;
  visits?: number;
}

export interface IOTATourDocument extends IOTATour, Document {
  _id: string;
}
