import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IInstagramAccountDocument } from '@/integrations/instagram/@types/accounts';
import { accountSchema } from '../definitions/accounts';

export interface IInstagramAccountModel extends Model<IInstagramAccountDocument> {
  getAccount(selector): Promise<IInstagramAccountDocument>;
}

export const loadInstagramAccountClass = (models: IModels) => {
  class Account {
    public static async getAccount(selector) {
      const account = await models.InstagramAccounts.findOne(selector);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};
