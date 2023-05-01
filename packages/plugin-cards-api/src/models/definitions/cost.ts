import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICost {
  code: string;
  name: string;
}

export interface ICostDocument extends ICost, Document {
  _id: string;
}

export const datasSchema = new Schema({
  name: field({ type: String, label: 'Name' }),
  code: field({ type: String, label: 'Code' })
});
export const costSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  code: field({ type: String, label: 'code' })
});

// export const costSchema = new Schema({
//   _id: field({ pkey: true }),
//   data: field({ type: [datasSchema], default: [], label: "Data" }),
// });
