import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { topupSchema, ITopup, ITopupDocument } from './definitions/topup';

export interface ITopupModel extends Model<ITopupDocument> {
  createTopup(doc: any): ITopupDocument;
}

export const loadTopupClass = (models: IModels) => {
  class Topup {
    /*
     * Get a Topup
     */
    public static async getAccount(doc: any) {
      const account = await models.Topups.findOne(doc);

      if (!account) {
        throw new Error('Account not found');
      }

      return account;
    }

    /*
     * Create or update a Topup
     */
    public static async createTopup(doc: ITopup) {
      const topup = await models.Topups.findOne({ invoiceId: doc.invoiceId });

      if (topup) {
        throw new Error('Topup already exists');
      }

      const newTopup = await models.Topups.create(doc);

      return newTopup;
    }
  }

  topupSchema.loadClass(Topup);

  return topupSchema;
};
