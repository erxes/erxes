import { Document, model, Schema } from 'mongoose';
import { field } from './utils';

export interface IAccount {
  kind: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export interface IAccountDocument extends IAccount, Document {}

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: {
    type: String,
  },
  token: {
    type: String,
  },
  tokenSecret: {
    type: String,
    optional: true,
  },
  scope: {
    type: String,
    optional: true,
  },
  expireDate: {
    type: String,
    optional: true,
  },
  name: { type: String },
  uid: { type: String },
});

// tslint:disable-next-line
const Accounts = model<IAccountDocument>('accounts', accountSchema);

export default Accounts;
