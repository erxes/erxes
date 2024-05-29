import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPurpose {
  name: string;
  typeId: string;
}

export interface IPurposeDocument extends IPurpose, Document {
  _id: string;
}

export const purposeSchema = new Schema<IPurpose>({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Created By' }),
  typeId: field({ type: String, label: 'Created By' })
});
