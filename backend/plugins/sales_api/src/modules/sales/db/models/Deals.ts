import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDeal, IDealDocument } from '../../@types';
import {
  createBoardItem,
  destroyBoardItemRelations,
  fillSearchTextItem,
  getTotalAmounts,
  watchItem,
} from '../../utils';
import { dealSchema } from '../definitions/deals';
import {
  generateDealUpdateActivityLogs,
  generateDealCreatedActivityLog,
  generateDealWatchActivityLog,
} from '~/modules/sales/meta/activity-log';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IDealModel extends Model<IDealDocument> {
  getDeal(_id: string): Promise<IDealDocument>;
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  watchDeal(_id: string, isAdd: boolean, userId: string): Promise<void>;
  removeDeals(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadDealClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, getContext, createActivityLog }: EventDispatcherReturn,
) => {
  class Deal {
    /** Get single deal */
    public static async getDeal(_id: string) {
      const deal = await models.Deals.findOne({ _id });
      if (!deal) throw new Error('Deal not found');
      return deal;
    }

    /** Create deal */
    public static async createDeal(doc: IDeal) {
      // Prevent duplicate conversion from conversation
      if (doc.sourceConversationIds?.length) {
        const existing = await models.Deals.findOne({
          sourceConversationIds: { $in: doc.sourceConversationIds },
        });
        if (existing) throw new Error('Already converted a deal');
      }

      // Calculate totals
      if (doc.productsData) {
        doc.productsData = doc.productsData.filter((pd) => pd);
        const totals = await getTotalAmounts(doc.productsData);
        Object.assign(doc, totals);
      }

      const deal = await createBoardItem(models, doc);

      sendDbEventLog?.({
        action: 'create',
        docId: deal._id,
        currentDocument: deal.toObject(),
      });

      createActivityLog(generateDealCreatedActivityLog(deal));

      return deal;
    }

    public static async updateDeal(_id: string, doc: IDeal) {
      const prevDeal = await models.Deals.getDeal(_id);
      const prevDealObj = prevDeal.toObject();

      // Fill searchText for indexing
      const searchText = fillSearchTextItem(doc, prevDeal);

      if (doc.productsData) {
        doc.productsData = doc.productsData.filter((pd) => pd.productId);
        const totals = await getTotalAmounts(doc.productsData);
        Object.assign(doc, totals);
      }

      await models.Deals.updateOne({ _id }, { $set: { ...doc, searchText } });

      const updatedDeal = await models.Deals.getDeal(_id);
      const updatedDealObj = updatedDeal.toObject();

      sendDbEventLog?.({
        action: 'update',
        docId: updatedDeal._id,
        currentDocument: updatedDealObj,
        prevDocument: prevDealObj,
      });

      await generateDealUpdateActivityLogs(
        prevDealObj,
        updatedDealObj,
        models,
        createActivityLog,
        subdomain,
      );

      return updatedDeal;
    }

    public static async watchDeal(_id: string, isAdd: boolean, userId: string) {
      const deal = await models.Deals.getDeal(_id);

      await watchItem(models.Deals, _id, isAdd, userId);

      createActivityLog(
        generateDealWatchActivityLog(deal.toObject(), isAdd, userId),
      );
    }

    public static async removeDeals(_ids: string[]) {
      const deals = await models.Deals.find({ _id: { $in: _ids } });

      for (const deal of deals) {
        sendDbEventLog?.({
          action: 'delete',
          docId: deal._id,
        });
      }

      await destroyBoardItemRelations(subdomain, models, _ids);

      return models.Deals.deleteMany({ _id: { $in: _ids } });
    }
  }

  dealSchema.loadClass(Deal);
  return dealSchema;
};
