import { Document, Model, Schema, HydratedDocument } from 'mongoose';

import { IModels } from '../connectionResolver';
import { field } from './definitions/utils';

export interface IAccount {
  _id: string;
  kind: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export type IAccountDocument = HydratedDocument<IAccount>;

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: { type: String },
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

export interface IAccountModel extends Model<IAccountDocument> {
  getAccount(selector): Promise<IAccountDocument>;
}

export const loadAccountClass = (models: IModels) => {
  class Account {
    public static async getAccount(selector) {
      const account = await models.Accounts.findOne(selector);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};
