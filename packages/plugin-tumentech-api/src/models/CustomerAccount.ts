import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  customerAccountSchema,
  ICustomerAccount,
  ICustomerAccountDocument
} from './definitions/customerAccount';

export interface ICustomerAccountModel extends Model<ICustomerAccountDocument> {
  getAccount(doc: any): ICustomerAccountDocument;
  createOrUpdateAccount(doc: ICustomerAccount): ICustomerAccountDocument;
  addTopupAmount(doc: any): ICustomerAccountDocument;
}

export const loadCustomerAccountClass = (models: IModels) => {
  class CustomerAccount {
    /*
     * Get a CustomerAccount
     */
    public static async getAccount(doc: any) {
      const account = await models.CustomerAccounts.findOne(doc);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }

    /*
     * Create or update a CustomerAccount
     */
    public static async createOrUpdateAccount(doc: ICustomerAccount) {
      const { customerId, balance } = doc;

      let account = await models.CustomerAccounts.findOne({
        customerId
      });

      if (!account) {
        account = await models.CustomerAccounts.create({
          customerId,
          balance
        });

        return account;
      }

      account.balance = balance + account.balance;

      await account.save();

      return models.CustomerAccounts.getAccount({ _id: account._id });
    }

    public static async addTopupAmount(doc: any) {
      const { customerId, amount } = doc;

      let account = await models.CustomerAccounts.findOne({ customerId });

      if (!account) {
        throw new Error('Account not found');
      }

      account.balance = amount + account.balance;

      await account.save();

      return models.CustomerAccounts.getAccount({ _id: account._id });
    }
  }

  customerAccountSchema.loadClass(CustomerAccount);

  return customerAccountSchema;
};
