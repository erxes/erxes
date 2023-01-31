import { Document, Model, Schema } from 'mongoose';

import { IModels } from '.';
import { field } from './definitions/utils';

export interface IAccount {
  kind?: string;
  access_token?: string;
  refresh_token?: string;
  access_token_expires_in?: string | number;
  refresh_token_expires_in?: string | number;
  scope?: string;
  name?: string;
  oa_id?: string;
  avatar?: string;
}

export interface IAccountDocument extends IAccount, Document {}

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: { type: String },
  access_token: {
    type: String
  },
  refresh_token: {
    type: String
  },
  scope: {
    type: String,
    optional: true
  },
  access_token_expires_in: {
    type: String || Number
  },
  refresh_token_expires_in: {
    type: String || Number
  },
  name: { type: String },
  oa_id: { type: String },
  avatar: { type: String }
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
    static async removeAccount(_id) {
      return models.Accounts.deleteOne({ _id });
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};
