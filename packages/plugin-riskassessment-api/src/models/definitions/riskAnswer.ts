import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IRiskAnswerDocument extends Document {
  _id: string;
  name: string;
  categoryId: string;
  value: string;
}

export const riskAnswerSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Answer Name' }),
  categoryId: field({ type: String, label: 'Answer Category Id' }),
  value: field({ type: Number, label: 'Answer Value' }),
});

export const riskAnswerCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: {},
});
