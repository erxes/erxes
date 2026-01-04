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
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import {
  generateDealActivityLogs,
  generateDealCreatedActivityLog,
  generateDealMovedActivityLog,
  generateDealConvertedActivityLog,
} from '~/utils/activityLogs';

export interface IDealModel extends Model<IDealDocument> {
  getDeal(_id: string): Promise<IDealDocument>;
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  watchDeal(_id: string, isAdd: boolean, userId: string): void;
  removeDeals(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadDealClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class Deal {
    public static async getDeal(_id: string) {
      const deal = await models.Deals.findOne({ _id });

      if (!deal) {
        throw new Error('Deal not found');
      }

      return deal;
    }

    public static async createDeal(doc: IDeal) {
      if (doc.sourceConversationIds) {
        const convertedDeal = await models.Deals.findOne({
          sourceConversationIds: { $in: doc.sourceConversationIds },
        });

        if (convertedDeal) {
          throw new Error('Already converted a deal');
        }
      }

      if (doc.productsData) {
        doc.productsData = doc.productsData.filter((pd) => pd);
        Object.assign(doc, { ...getTotalAmounts(doc.productsData) });
      }

      const deal = await createBoardItem(models, doc);

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: deal._id,
        currentDocument: deal.toObject(),
      });

      // Create activity log for deal creation
      createActivityLog(generateDealCreatedActivityLog(deal, doc.userId));

      // Create conversion activity log if it came from conversation
      if (doc.sourceConversationIds && doc.sourceConversationIds.length > 0) {
        createActivityLog(
          generateDealConvertedActivityLog(deal, doc.sourceConversationIds[0]),
        );
      }

      return deal;
    }

    public static async updateDeal(_id: string, doc: IDeal) {
      const prevDeal = await models.Deals.getDeal(_id);
      const searchText = fillSearchTextItem(doc, prevDeal);

      if (doc.productsData) {
        doc.productsData = doc.productsData.filter((pd) => pd && pd.productId);
        Object.assign(doc, { ...getTotalAmounts(doc.productsData) });
      }

      await models.Deals.updateOne({ _id }, { $set: doc, searchText });

      const updatedDeal = await models.Deals.findOne({ _id });

      if (updatedDeal) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: updatedDeal._id,
          currentDocument: updatedDeal.toObject(),
          prevDocument: prevDeal.toObject(),
        });

        // Check if stage was changed
        if (doc.stageId && doc.stageId !== prevDeal.stageId) {
          const [fromStage, toStage] = await Promise.all([
            models.Stages.findOne({ _id: prevDeal.stageId }, { name: 1 }),
            models.Stages.findOne({ _id: doc.stageId }, { name: 1 }),
          ]);

          // Create activity log for stage movement
          createActivityLog(
            generateDealMovedActivityLog(
              updatedDeal,
              prevDeal.stageId,
              doc.stageId,
              fromStage?.name,
              toStage?.name,
            ),
          );
        }

        // Generate activity logs for other field changes
        await generateDealActivityLogs(
          prevDeal.toObject(),
          updatedDeal.toObject(),
          models,
          createActivityLog,
        );
      }

      return updatedDeal;
    }

    public static watchDeal(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Deals, _id, isAdd, userId);
    }

    public static async removeDeals(_ids: string[]) {
      // Create activity logs for each deal being deleted
      const deals = await models.Deals.find({ _id: { $in: _ids } });

      for (const deal of deals) {
        // Send database event log
        sendDbEventLog({
          action: 'delete',
          docId: deal._id,
        });

        // Create activity log
        createActivityLog({
          activityType: 'delete',
          target: {
            _id: deal._id,
            moduleName: 'sales',
            collectionName: 'deals',
          },
          action: {
            type: 'delete',
            description: 'Deal deleted',
          },
          changes: {
            name: deal.name,
            deletedAt: new Date(),
          },
          metadata: {
            stageId: deal.stageId,
            userId: deal.userId,
          },
        });
      }

      // completely remove all related things
      for (const _id of _ids) {
        await destroyBoardItemRelations(models, _id);
      }

      return models.Deals.deleteMany({ _id: { $in: _ids } });
    }
  }

  dealSchema.loadClass(Deal);

  return dealSchema;
};