import { Model } from 'mongoose';
import {
  destroyBoardItemRelations,
  fillSearchTextItem,
  createBoardItem,
  watchItem
} from './utils';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import {
  purchaseSchema,
  IPurchase,
  IPurchaseDocument
} from './definitions/purchases';
import { IModels } from '../connectionResolver';

export interface IPurchaseModel extends Model<IPurchaseDocument> {
  getPurchase(_id: string): Promise<IPurchaseDocument>;
  createPurchase(doc: IPurchase): Promise<IPurchaseDocument>;
  updatePurchase(_id: string, doc: IPurchase): Promise<IPurchaseDocument>;
  watchPurchase(_id: string, isAdd: boolean, userId: string): void;
  removePurchases(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadPurchaseClass = (models: IModels, subdomain: string) => {
  class Purchase {
    public static async getPurchase(_id: string) {
      const Purchase = await models.Purchases.findOne({ _id });

      if (!Purchase) {
        throw new Error('Purchase not found');
      }

      return Purchase;
    }

    /**
     * Create a Purchase
     */
    public static async createPurchase(doc: IPurchase) {
      if (doc.sourceConversationIds) {
        const convertedPurchase = await models.Purchases.findOne({
          sourceConversationIds: { $in: doc.sourceConversationIds }
        });

        if (convertedPurchase) {
          throw new Error('Already converted a purchase');
        }
      }

      return createBoardItem(models, subdomain, doc, 'purchase');
    }

    /**
     * Update Purchase
     */
    public static async updatePurchase(_id: string, doc: IPurchase) {
      const searchText = fillSearchTextItem(
        doc,
        await models.Purchases.getPurchase(_id)
      );

      await models.Purchases.updateOne({ _id }, { $set: doc, searchText });
      return models.Purchases.findOne({ _id });
    }

    /**
     * Watch Purchase
     */
    public static watchPurchase(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Purchases, _id, isAdd, userId);
    }

    public static async removePurchases(_ids: string[]) {
      // completely remove all related things
      for (const _id of _ids) {
        await destroyBoardItemRelations(
          models,
          subdomain,
          _id,
          ACTIVITY_CONTENT_TYPES.PURCHASE
        );
      }

      return models.Purchases.deleteMany({ _id: { $in: _ids } });
    }
  } // end Purchase class

  purchaseSchema.loadClass(Purchase);

  return purchaseSchema;
};
