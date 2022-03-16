import { Model } from 'mongoose';
import {
  destroyBoardItemRelations,
  fillSearchTextItem,
  createBoardItem,
  watchItem
} from './utils';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import { dealSchema, IDeal, IDealDocument } from './definitions/deals';
import { IModels } from '../connectionResolver';

export interface IDealModel extends Model<IDealDocument> {
  getDeal(_id: string): Promise<IDealDocument>;
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  watchDeal(_id: string, isAdd: boolean, userId: string): void;
  removeDeals(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadDealClass = (models: IModels, subdomain: string) => {
  class Deal {
    public static async getDeal(_id: string) {
      const deal = await models.Deals.findOne({ _id });

      if (!deal) {
        throw new Error('Deal not found');
      }

      return deal;
    }

    /**
     * Create a deal
     */
    public static async createDeal(doc: IDeal) {
      if (doc.sourceConversationIds) {
        const convertedDeal = await models.Deals.findOne({
          sourceConversationIds: { $in: doc.sourceConversationIds }
        });

        if (convertedDeal) {
          throw new Error('Already converted a deal');
        }
      }

      return createBoardItem(models, subdomain, doc, 'deal');
    }

    /**
     * Update Deal
     */
    public static async updateDeal(_id: string, doc: IDeal) {
      const searchText = fillSearchTextItem(doc, await models.Deals.getDeal(_id));

      await models.Deals.updateOne({ _id }, { $set: doc, searchText });

      return models.Deals.findOne({ _id });
    }

    /**
     * Watch deal
     */
    public static watchDeal(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Deals, _id, isAdd, userId);
    }

    public static async removeDeals(_ids: string[]) {
      // completely remove all related things
      for (const _id of _ids) {
        await destroyBoardItemRelations(models, subdomain, _id, ACTIVITY_CONTENT_TYPES.DEAL);
      }

      return models.Deals.deleteMany({ _id: { $in: _ids } });
    }
  } // end Deal class

  dealSchema.loadClass(Deal);

  return dealSchema;
};