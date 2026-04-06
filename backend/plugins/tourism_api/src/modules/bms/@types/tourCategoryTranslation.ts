import { Document } from 'mongoose';

export interface ITourCategoryTranslation {
  objectId: string;
  language: string;
  name?: string;
}

export interface ITourCategoryTranslationDocument
  extends ITourCategoryTranslation,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}