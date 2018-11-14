import { Document, Schema } from 'mongoose';
import { field } from '../utils';

export interface IAccount {
  kind: string;
  token: string;
  name: string;
  uid: string;
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
}

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: field({
    type: String,
  }),
  token: field({
    type: String,
  }),
  name: field({ type: String }),
  uid: field({ type: String }),
});
