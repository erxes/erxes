import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { accountSchema } from '@/integrations/facebook/db/definitions/accounts';
import { IFacebookAccountDocument } from '@/integrations/facebook/@types/accounts';
export interface IFacebookAccountModel extends Model<IFacebookAccountDocument> {
  getAccount(selector): Promise<IFacebookAccountDocument>;
}

export const loadFacebookAccountClass = (models: IModels) => {
  class Account {
    public static async getAccount(selector) {
      const account = await models.FacebookAccounts.findOne(selector);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};
