import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  purchaseHistorySchema,
  IPurchaseHistory,
  IPurchaseHistoryDocument
} from './definitions/customerPurchaseHistory';

export interface IPurchaseHistoryModel extends Model<IPurchaseHistoryDocument> {
  getHistory(doc: any): IPurchaseHistoryDocument;
  createHistory(doc: IPurchaseHistory): IPurchaseHistoryDocument;
}

export const loadPurchaseHistoryClass = (models: IModels) => {
  class PurchaseHistory {
    /*
     * Get a CustomerPurchaseHistory
     */
    public static async getHistory(doc: any) {
      const history = await models.PurchaseHistories.findOne(doc);

      if (!history) {
        throw new Error('history not found');
      }

      return history;
    }

    public static async createHistory(doc: IPurchaseHistory) {
      const history = await models.PurchaseHistories.findOne({
        dealId: doc.dealId,
        driverId: doc.driverId,
        cpUserId: doc.cpUserId
      });

      if (history) {
        throw new Error('History already exists');
      }

      return models.PurchaseHistories.create(doc);
    }
  }

  purchaseHistorySchema.loadClass(PurchaseHistory);

  return purchaseHistorySchema;
};
