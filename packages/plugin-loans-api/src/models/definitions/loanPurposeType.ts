import { Document, Schema, HydratedDocument } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface IPurposeType {
  _id: string;
  name: string;
}

export type IPurposeTypeDocument = HydratedDocument<IPurposeType>;

export const purposeTypeSchema = new Schema<IPurposeType>({
  _id: field({ pkey: true }),
  name: field({ type: String })
});
