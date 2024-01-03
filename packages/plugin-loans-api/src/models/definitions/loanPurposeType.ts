import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IPurposeType {
  name: string;
}

export interface IPurposeTypeDocument extends IPurposeType, Document {
  _id: string;
}

export const purposeTypeSchema = new Schema<IPurposeType>({
  _id: field({ pkey: true }),
  name: field({ type: String })
});
