import { Document, model, Model, Schema } from 'mongoose';
import { field } from './utils';

export interface IAccount {
  kind: string;
  email: string;
  username?: string;
  host: string;
  password: string;
  imapHost: string;
  smtpHost: string;
  imapPort: number;
  smtpPort: number;
  nylasToken: string;
  nylasTokenSecret: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  billingState?: string;
  uid: string;
  nylasAccountId?: string;
  nylasBillingState?: string;
}

export interface IAccountDocument extends IAccount, Document {}

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: {
    type: String
  },
  billingState: {
    type: String,
    optional: true
  },
  email: {
    type: String
  },
  username: {
    type: String,
    optional: true
  },
  host: {
    type: String
  },
  imapHost: {
    type: String
  },
  smtpHost: {
    type: String
  },
  imapPort: {
    type: Number
  },
  smtpPort: {
    type: Number
  },
  password: {
    type: String,
    optional: true
  },
  nylasToken: {
    type: String
  },
  nylasTokenSecret: {
    type: String,
    optional: true
  },
  token: {
    type: String
  },
  tokenSecret: {
    type: String,
    optional: true
  },
  scope: {
    type: String,
    optional: true
  },
  expireDate: {
    type: String,
    optional: true
  },
  name: { type: String },
  uid: { type: String },
  nylasAccountId: {
    type: String,
    optional: true
  },
  nylasBillingState: {
    type: String,
    optional: true
  }
});

export interface IAccountModel extends Model<IAccountDocument> {
  getAccount(selector): Promise<IAccountDocument>;
}

export const loadClass = () => {
  class Account {
    public static async getAccount(selector) {
      const account = await Accounts.findOne(selector);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};

loadClass();

// tslint:disable-next-line
const Accounts = model<IAccountDocument, IAccountModel>(
  'accounts',
  accountSchema
);

export default Accounts;
