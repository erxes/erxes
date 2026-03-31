import { Document } from 'mongoose';

export interface IElementTranslation {
  objectId: string;
  language: string;
  name?: string;
  note?: string;
  cost?: number;
}

export interface IElementTranslationDocument
  extends IElementTranslation,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}