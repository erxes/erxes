import { Document, Schema, HydratedDocument } from 'mongoose';
import { field } from './utils';

export interface IPurpose {
  _id: string;
  name: string;
  typeId: string;
}

export type IPurposeDocument = HydratedDocument<IPurpose>;

export const purposeSchema = new Schema<IPurpose>({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Created By' }),
  typeId: field({ type: String, label: 'Created By' })
});
