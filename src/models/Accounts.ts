import { Document, Schema } from 'mongoose';
import { integrationsConnection } from '../connection';

export interface IAccount {
  kind: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
}

export const accountSchema = new Schema({
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
const Accounts = integrationsConnection.model<IAccountDocument>('accounts', accountSchema);

export default Accounts;
