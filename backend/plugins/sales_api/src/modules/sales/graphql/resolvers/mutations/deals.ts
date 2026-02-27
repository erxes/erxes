import { IContext } from '~/connectionResolvers';
import { IDeal, IDealDocument, IProductData } from '~/modules/sales/@types';
import { SALES_STATUSES } from '~/modules/sales/constants';
import {
  checkMovePermission,
  createRelations,
  getCompanyIds,
  getCustomerIds,
  getNewOrder,
  getTotalAmounts,
} from '~/modules/sales/utils';
import {
  checkAssignedUserFromPData,
  copyChecklists,
  itemMover,
  subscriptionWrapper,
} from '../utils';
import { addDeal, editDeal } from './utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(
    _root,
    doc: IDeal & { processId: string; aboveItemId: string },
    { user, models, subdomain }: IContext,
  ) {
    return await addDeal({ models, subdomain, user, doc });
  },

  /**
   * Edits a deal
   */
  async dealsEdit(
    _root,
    { _id, processId, ...doc }: IDealDocument & { processId: string },
    { user, models, subdomain }: IContext,
  ) {
    return await editDeal({ models, subdomain, _id, processId, doc, user });
  },

  /**
   * Change deal
   */
  async dealsChange(
    _root,
    doc: {
      processId: string;
      itemId: string;
      aboveItemId?: string;
      destinationStageId: string;
      sourceStageId: string;
    },
    { user, models, subdomain }: IContext,
  ) {
    const { itemId, aboveItemId, sourceStageId, destinationStageId } = doc;

    const item = await models.Deals.findOne({ _id: itemId });

    if (!item) {
      throw new Error('Deal not found');
    }

    const stage = await models.Stages.getStage(item.stageId);

    const extendedDoc: IDeal = {
      modifiedBy: user._id,
      stageId: destinationStageId,
      order: await getNewOrder({
        collection: models.Deals,
        stageId: destinationStageId,
        aboveItemId,
      }),
    };

    if (item.stageId !== destinationStageId) {
      checkMovePermission(stage, user);

      const destinationStage = await models.Stages.getStage(destinationStageId);

      checkMovePermission(destinationStage, user);

      //   await doScoreCampaign(subdomain, models, itemId, {
      //     ...item.toObject(),
      //     ...extendedDoc,
      //   });

      extendedDoc.stageChangedDate = new Date();
    }

    const updatedItem = await models.Deals.updateDeal(itemId, extendedDoc);
    await sendTRPCMessage({
      subdomain,
      pluginName: 'mongolian',
      module: 'productPlaces',
      action: 'afterDealStageChanged',
      method: 'mutation',
      input: {
        deal: updatedItem,
        sourceStageId,
        userId: user._id,
      },
    });

    await itemMover(models, user._id, item, destinationStageId);
    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal: item,
      pipelineId: stage.pipelineId,
    });

    return updatedItem;
  },

  /**
   * Remove deal
   */
  async dealsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const item = await models.Deals.findOne({ _id });

    if (!item) {
      throw new Error('Deal not found');
    }

    const removed = await models.Deals.removeDeals([item._id]);

    await subscriptionWrapper(models, {
      action: 'delete',
      dealId: item._id,
      oldDeal: item,
    });

    return removed;
  },

  /**
   * Watch deal
   */
  async dealsWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext,
  ) {
    return models.Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(
    _root,
    { _id, processId }: { _id: string; processId: string },
    { user, models, subdomain }: IContext,
  ) {
    const item = await models.Deals.findOne({ _id }).lean();

    if (!item) {
      throw new Error('No Item Found');
    }

    const doc = {
      ...item,
      _id: undefined,
      userId: user._id,
      modifiedBy: user._id,
      watchedUserIds: [user._id],
      assignedUserIds: item.assignedUserIds,
      name: `${item.name}-copied`,
      initialStageId: item.initialStageId,
      stageId: item.stageId,
      description: item.description,
      priority: item.priority,
      labelIds: item.labelIds,
      order: await getNewOrder({
        collection: models.Deals,
        stageId: item.stageId,
        aboveItemId: item._id,
      }),

      attachments: (item.attachments || []).map((a) => ({
        url: a.url,
        name: a.name,
        type: a.type,
        size: a.size,
      })),
    };

    delete doc.sourceConversationIds;

    for (const param of ['productsData', 'paymentsData']) {
      doc[param] = item[param];
    }

    const clone = await models.Deals.createDeal(doc);

    const companyIds = await getCompanyIds(subdomain, _id);
    const customerIds = await getCustomerIds(subdomain, _id);

    await createRelations(subdomain, {
      dealId: clone._id,
      companyIds,
      customerIds,
    });

    await copyChecklists(models, {
      contentType: 'deal',
      contentTypeId: item._id,
      targetContentId: clone._id,
      user,
    });

    // order notification
    const stage = await models.Stages.getStage(clone.stageId);

    await subscriptionWrapper(models, {
      action: 'create',
      deal: clone,
      pipelineId: stage.pipelineId,
    });
    return clone;
  },

  async dealsArchive(
    _root,
    { stageId, processId }: { stageId: string; processId: string },
    { user, models }: IContext,
  ) {
    const items = await models.Deals.find({
      stageId,
      status: { $ne: SALES_STATUSES.ARCHIVED },
    }).lean();

    await models.Deals.updateMany(
      { stageId, status: { $ne: SALES_STATUSES.ARCHIVED } },
      { $set: { status: SALES_STATUSES.ARCHIVED } },
    );

    const stage = await models.Stages.findOne({ _id: stageId }).lean();
    const pipelineId = stage?.pipelineId;

    items.forEach(async (item) => {
      await graphqlPubsub.publish('salesDealListChanged', {
        salesDealListChanged: {
          pipelineIds: [pipelineId],
          deal: item,
          oldDeal: { ...item, status: SALES_STATUSES.ARCHIVED },
        },
      });
    });

    return 'ok';
  },

  async dealsCreateProductsData(
    _root,
    {
      processId,
      dealId,
      docs,
    }: {
      processId: string;
      dealId: string;
      docs: IProductData[];
    },
    { models, user }: IContext,
  ) {
    const deal = await models.Deals.getDeal(dealId);
    const stage = await models.Stages.getStage(deal.stageId);

    const oldDataIds = (deal.productsData || []).map((pd) => pd._id);

    const { assignedUserIds, addedUserIds, removedUserIds } =
      checkAssignedUserFromPData(
        deal.assignedUserIds,
        [
          ...(deal.productsData || [])
            .filter((pdata) => pdata.assignUserId)
            .map((pdata) => pdata.assignUserId || ''),
          ...docs
            .filter((pdata) => pdata.assignUserId)
            .map((pdata) => pdata.assignUserId || ''),
        ],
        deal.productsData,
      );

    for (const doc of docs) {
      if (doc._id) {
        const checkDup = (deal.productsData || []).find(
          (pd) => pd._id === doc._id,
        );
        if (checkDup) {
          throw new Error('Deals productData duplicated');
        }
      }
    }

    // undefenid or null then true
    const tickUsed = !(stage.defaultTick === false);
    const addDocs = (docs || []).map(
      (doc) => ({ ...doc, tickUsed }) as IProductData,
    );
    const productsData: IProductData[] = (deal.productsData || []).concat(
      addDocs,
    );

    const updatedItem =
      (await models.Deals.findOneAndUpdate(
        { _id: dealId },
        {
          $set: {
            productsData,
            assignedUserIds,
            ...(await getTotalAmounts(productsData)),
          },
        },
        {
          new: true,
        },
      )) || ({} as any);

    const dataIds = (updatedItem.productsData || [])
      .filter((pd) => !oldDataIds.includes(pd._id))
      .map((pd) => pd._id);

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        processId,
        action: 'create',
        data: {
          dataIds,
          docs,
          productsData,
        },
      },
    });

    return {
      dataIds,
      productsData,
    };
  },

  async dealsEditProductData(
    _root,
    {
      processId,
      dealId,
      dataId,
      doc,
    }: {
      processId: string;
      dealId: string;
      dataId: string;
      doc: IProductData;
    },
    { models, user }: IContext,
  ) {
    const deal = await models.Deals.getDeal(dealId);

    if (!deal.productsData?.length) {
      throw new Error('Deals productData not found');
    }

    const oldPData = (deal.productsData || []).find(
      (pdata) => pdata._id === dataId,
    );

    if (!oldPData) {
      throw new Error('Deals productData not found');
    }

    const productsData: IProductData[] = (deal.productsData || []).map(
      (data) => (data._id === dataId ? { ...doc } : data),
    );

    const possibleAssignedUsersIds: string[] = (deal.productsData || [])
      .filter((pdata) => pdata._id !== dataId && pdata.assignUserId)
      .map((pdata) => pdata.assignUserId || '');

    if (doc.assignUserId) {
      possibleAssignedUsersIds.push(doc.assignUserId);
    }

    const { assignedUserIds, addedUserIds, removedUserIds } =
      checkAssignedUserFromPData(
        deal.assignedUserIds,
        possibleAssignedUsersIds,
        deal.productsData,
      );

    await models.Deals.updateOne(
      { _id: dealId },
      {
        $set: {
          productsData,
          assignedUserIds,
          ...(await getTotalAmounts(productsData)),
        },
      },
    );

    // const stage = await models.Stages.getStage(deal.stageId);
    // const updatedItem =
    //   (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //   salesPipelinesChanged: {
    //     _id: stage.pipelineId,
    //     processId,
    //     action: 'itemUpdate',
    //     data: {
    //       item: {
    //         ...updatedItem,
    //         ...(await itemResolver(
    //           models,
    //           subdomain,
    //           user,
    //           'deal',
    //           updatedItem,
    //         )),
    //       },
    //     },
    //   },
    // });

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        processId,
        action: 'edit',
        data: {
          dataId,
          doc,
          productsData,
        },
      },
    });

    return {
      dataId,
      productsData,
    };
  },

  async dealsDeleteProductData(
    _root,
    {
      processId,
      dealId,
      dataIds,
    }: {
      processId: string;
      dealId: string;
      dataIds: string[];
    },
    { models, user }: IContext,
  ) {
    const deal = await models.Deals.getDeal(dealId);

    const oldPData = (deal.productsData || []).filter(
      (pdata) => pdata._id && dataIds.includes(pdata._id),
    );

    if (!oldPData.length) {
      throw new Error('Deals productData not found');
    }

    const productsData = (deal.productsData || []).filter(
      (data) => !data._id || !dataIds.includes(data._id),
    );

    await models.Deals.updateOne(
      { _id: dealId },
      {
        $set: {
          productsData,
          ...(await getTotalAmounts(productsData)),
        },
      },
    );

    // const stage = await models.Stages.getStage(deal.stageId);
    // const updatedItem =
    //   (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //   salesPipelinesChanged: {
    //     _id: stage.pipelineId,
    //     processId,
    //     action: 'itemUpdate',
    //     data: {
    //       item: {
    //         ...updatedItem,
    //         ...(await itemResolver(
    //           models,
    //           subdomain,
    //           user,
    //           'deal',
    //           updatedItem,
    //         )),
    //       },
    //     },
    //   },
    // });

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        processId,
        action: 'delete',
        data: {
          dataIds,
          productsData,
        },
      },
    });

    return {
      dataIds,
      productsData,
    };
  },
};
