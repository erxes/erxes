import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDeal, IDealDocument, IDealSplitInput } from '../../@types';
import { SALES_STATUSES } from '../../constants';
import {
  createBoardItem,
  createRelations,
  destroyBoardItemRelations,
  fillSearchTextItem,
  getCompanyIds,
  getCustomerIds,
  getNewOrder,
  getTotalAmounts,
  watchItem,
} from '../../utils';
import {
  mergeProductsData,
  removeSplitProductsData,
  selectSplitProductsData,
  unionIds,
  validateMergeInput,
  validateSplitInput,
} from '../../mergeSplit';
import { dealSchema } from '../definitions/deals';
import {
  generateDealUpdateActivityLogs,
  generateDealCreatedActivityLog,
  generateDealMergedActivityLog,
  generateDealMergedIntoActivityLog,
  generateDealSplitActivityLog,
  generateDealSplitChildActivityLog,
  generateDealWatchActivityLog,
} from '~/modules/sales/meta/activity-log';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IDealModel extends Model<IDealDocument> {
  getDeal(_id: string): Promise<IDealDocument>;
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  watchDeal(_id: string, isAdd: boolean, userId: string): Promise<void>;
  removeDeals(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeDeals(
    sourceDealIds: string[],
    targetDealId: string,
    name?: string,
  ): Promise<IDealDocument>;
  splitDeal(
    dealId: string,
    splits: IDealSplitInput[],
  ): Promise<IDealDocument[]>;
}

export const loadDealClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
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

      sendDbEventLog({
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

      sendDbEventLog({
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
        sendDbEventLog({
          action: 'delete',
          docId: deal._id,
        });
      }

      await destroyBoardItemRelations(subdomain, models, _ids);

      return models.Deals.deleteMany({ _id: { $in: _ids } });
    }

    /**
     * Merge exactly one source deal into a target deal (two deals total).
     *
     * - products are combined onto the target (same product = summed quantity)
     * - deal-level fields (custom fields, assignees, labels, tags, branches,
     *   departments) are merged with no duplicates
     * - company/customer relations are unioned onto the target
     * - the source deal is soft-marked `merged` (never hard deleted) so its
     *   timeline/history stays traceable
     * - events + activity logs are emitted for target and source
     */
    public static async mergeDeals(
      sourceDealIds: string[],
      targetDealId: string,
      name?: string,
    ) {
      const sources = validateMergeInput(sourceDealIds, targetDealId);

      const mergedName = name?.trim();
      if (!mergedName) {
        throw new Error('A name for the merged deal is required');
      }

      const target = await models.Deals.getDeal(targetDealId);
      const sourceDeals = await models.Deals.find({ _id: { $in: sources } });

      if (sourceDeals.length !== sources.length) {
        throw new Error('Some source deals were not found');
      }

      const prevTargetObj = target.toObject();
      const sourceObjs = sourceDeals.map((deal) => deal.toObject());

      // Combine the product lines of both deals onto the target.
      const productsData = mergeProductsData(
        prevTargetObj.productsData || [],
        sourceObjs.map((source) => source.productsData || []),
      );

      const update: Partial<IDeal> & {
        totalAmount?: number;
        unUsedTotalAmount?: number;
        bothTotalAmount?: number;
      } = {
        name: mergedName,
        searchText: fillSearchTextItem({ name: mergedName }, target),
        productsData,
        ...(await getTotalAmounts(productsData)),
        assignedUserIds: unionIds(
          prevTargetObj.assignedUserIds,
          ...sourceObjs.map((source) => source.assignedUserIds),
        ),
        watchedUserIds: unionIds(
          prevTargetObj.watchedUserIds,
          ...sourceObjs.map((source) => source.watchedUserIds),
        ),
        labelIds: unionIds(
          prevTargetObj.labelIds,
          ...sourceObjs.map((source) => source.labelIds),
        ),
        tagIds: unionIds(
          prevTargetObj.tagIds,
          ...sourceObjs.map((source) => source.tagIds),
        ),
        branchIds: unionIds(
          prevTargetObj.branchIds,
          ...sourceObjs.map((source) => source.branchIds),
        ),
        departmentIds: unionIds(
          prevTargetObj.departmentIds,
          ...sourceObjs.map((source) => source.departmentIds),
        ),
        mergedDealIds: unionIds(prevTargetObj.mergedDealIds, sources),
        mergedAt: new Date(),
      };

      await models.Deals.updateOne({ _id: targetDealId }, { $set: update });
      const updatedTarget = await models.Deals.getDeal(targetDealId);

      // Soft-mark sources as merged (keep them for history/traceability)
      await models.Deals.updateMany(
        { _id: { $in: sources } },
        {
          $set: {
            status: SALES_STATUSES.MERGED,
            mergedIntoId: targetDealId,
            mergedAt: new Date(),
          },
        },
      );

      // Union company/customer relations onto the target without duplicates
      const targetCompanyIds = await getCompanyIds(subdomain, targetDealId);
      const targetCustomerIds = await getCustomerIds(subdomain, targetDealId);

      let companyIds: string[] = [];
      let customerIds: string[] = [];
      for (const sourceId of sources) {
        companyIds = unionIds(
          companyIds,
          await getCompanyIds(subdomain, sourceId),
        );
        customerIds = unionIds(
          customerIds,
          await getCustomerIds(subdomain, sourceId),
        );
      }

      await createRelations(subdomain, {
        dealId: targetDealId,
        companyIds: companyIds.filter((id) => !targetCompanyIds.includes(id)),
        customerIds: customerIds.filter(
          (id) => !targetCustomerIds.includes(id),
        ),
      });

      // Events + activity logs
      sendDbEventLog({
        action: 'update',
        docId: targetDealId,
        currentDocument: updatedTarget.toObject(),
        prevDocument: prevTargetObj,
      });

      for (const source of sourceObjs) {
        sendDbEventLog({
          action: 'update',
          docId: source._id,
          currentDocument: {
            ...source,
            status: SALES_STATUSES.MERGED,
            mergedIntoId: targetDealId,
          },
          prevDocument: source,
        });
      }

      createActivityLog(
        generateDealMergedActivityLog(updatedTarget.toObject(), sources),
      );
      for (const source of sourceObjs) {
        createActivityLog(
          generateDealMergedIntoActivityLog(source, targetDealId),
        );
      }

      return updatedTarget;
    }

    /**
     * Split a deal into one or more child deals.
     *
     * - each child can take a subset of the source's product lines and/or an
     *   explicit allocated amount (partial allocation)
     * - children keep a `splitSourceId` back-reference and the original keeps
     *   `splitChildIds`, so both stay traceable; the original is untouched
     * - relations are copied to each child; create/split activity logs emitted
     */
    public static async splitDeal(dealId: string, splits: IDealSplitInput[]) {
      const source = await models.Deals.getDeal(dealId);
      const sourceObj = source.toObject();

      validateSplitInput(splits, sourceObj.productsData || []);

      const companyIds = await getCompanyIds(subdomain, dealId);
      const customerIds = await getCustomerIds(subdomain, dealId);

      const childIds: string[] = [];
      const children: IDealDocument[] = [];

      for (const split of splits) {
        const productsData = selectSplitProductsData(
          split,
          sourceObj.productsData || [],
        );

        const stageId = split.stageId || sourceObj.stageId;

        const childDoc: IDeal = {
          name: split.name || `${sourceObj.name || 'Deal'} (split)`,
          stageId,
          initialStageId: stageId,
          assignedUserIds: split.assignedUserIds || sourceObj.assignedUserIds,
          watchedUserIds: sourceObj.watchedUserIds,
          labelIds: sourceObj.labelIds,
          tagIds: sourceObj.tagIds,
          branchIds: sourceObj.branchIds,
          departmentIds: sourceObj.departmentIds,
          priority: sourceObj.priority,
          description:
            split.description != null
              ? split.description
              : sourceObj.description,
          userId: sourceObj.userId,
          productsData,
          propertiesData: sourceObj.propertiesData,
          customFieldsData: sourceObj.customFieldsData,
          splitSourceId: dealId,
          splitAt: new Date(),
          order: await getNewOrder({
            collection: models.Deals,
            stageId,
            aboveItemId: dealId,
          }),
        };

        // Amount-only allocation (no product lines moved)
        if (split.amount != null) {
          childDoc.extraData = {
            ...(childDoc.extraData || {}),
            splitAmount: split.amount,
          };
        }

        // createDeal emits the create event + created activity log
        const child = await models.Deals.createDeal(childDoc);
        childIds.push(child._id);
        children.push(child);

        await createRelations(subdomain, {
          dealId: child._id,
          companyIds,
          customerIds,
        });

        createActivityLog(
          generateDealSplitChildActivityLog(child.toObject(), dealId),
        );
      }

      // Product lines that were allocated to children are moved out of the
      // original deal so they aren't double-counted.
      const remainingProductsData = removeSplitProductsData(
        sourceObj.productsData || [],
        splits,
      );

      // Keep the original deal (traceable), record children, and drop the
      // product lines that were split off — recomputing its totals.
      await models.Deals.updateOne(
        { _id: dealId },
        {
          $set: {
            splitChildIds: unionIds(sourceObj.splitChildIds, childIds),
            splitAt: new Date(),
            productsData: remainingProductsData,
            ...(await getTotalAmounts(remainingProductsData)),
          },
        },
      );
      const updatedSource = await models.Deals.getDeal(dealId);

      sendDbEventLog({
        action: 'update',
        docId: dealId,
        currentDocument: updatedSource.toObject(),
        prevDocument: sourceObj,
      });

      createActivityLog(
        generateDealSplitActivityLog(updatedSource.toObject(), childIds),
      );

      return children;
    }
  }

  dealSchema.loadClass(Deal);
  return dealSchema;
};
