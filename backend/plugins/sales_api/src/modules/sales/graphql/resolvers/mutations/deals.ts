import { IContext } from '~/connectionResolvers';
import { IDeal, IDealDocument, IProductData } from '~/modules/sales/@types';
import { SALES_STATUSES } from '~/modules/sales/constants';
import {
  createRelations,
  getCompanyIds,
  getCustomerIds,
  getNewOrder,
  getTotalAmounts,
} from '~/modules/sales/utils';
import {
  checkAssignedUserFromPData,
  copyChecklists,
  subscriptionWrapper,
} from '../utils';
import { addDeal, changeDeal, createProductsData, editDeal } from './utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IUserDocument, Resolver } from 'erxes-api-shared/core-types';

export const dealMutations: Record<string, Resolver> = {
  /**
   * Creates a new deal
   */
  async dealsAdd(
    _root,
    doc: IDeal & { processId: string; aboveItemId: string },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('dealsAdd');
    return await addDeal({ models, subdomain, user, doc });
  },

  /**
   * Edits a deal
   */
  async dealsEdit(
    _root,
    { _id, processId, ...doc }: IDealDocument & { processId: string },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');
    return await editDeal({ models, subdomain, _id, processId, doc, user });
  },

  async cpDealsEdit(
    _root,
    { _id, processId, ...doc }: IDealDocument & { processId: string },
    {  models, subdomain ,cpUser}: IContext,
  ) {
    const userId =
    cpUser?.erxesCustomerId ||
    cpUser?._id || null;
    
    if (!userId) {
      throw new Error('ClientPortal User not found');
    }

    const user = { _id: `cp:${userId}` } as IUserDocument;

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
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');

    return changeDeal(subdomain, models, user._id, { ...doc });
  },

  async cpDealsChange(
    _root,
    doc: {
      processId: string;
      itemId: string;
      aboveItemId?: string;
      destinationStageId: string;
      sourceStageId: string;
    },
    { cpUser, models, subdomain }: IContext,
  ) {
    const userId =
      cpUser?.erxesCustomerId ||
      cpUser?._id ||
      null;
    if (!userId) {
        throw new Error('ClientPortal User not found');
    }
    return changeDeal(subdomain, models, `cp:${userId}`, { ...doc });
  },

  /**
   * Remove deal
   */
  async dealsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('dealsRemove');
    const item = await models.Deals.findOne({ _id });

    if (!item) {
      throw new Error('Deal not found');
    }

    const stage = await models.Stages.getStage(item.stageId);

    const { canEditMemberIds } = stage;

    if (
      canEditMemberIds &&
      canEditMemberIds.length > 0 &&
      !canEditMemberIds.includes(user._id)
    ) {
      throw new Error('Permission denied');
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
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('dealsWatch');
    return models.Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(
    _root,
    { _id, processId }: { _id: string; processId: string },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('dealsAdd');
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

    for (const param of [
      'productsData',
      'paymentsData',
      'mobileAmount',
      'mobileAmounts',
    ]) {
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
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('dealsArchive');
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
    }: { processId: string; dealId: string; docs: IProductData[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');
    return createProductsData({ models, processId, dealId, docs });
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
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');
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
        { new: true },
      )) || ({} as any);

    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal: deal,
    });

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

  async cpDealsCreateProductsData(
    _root,
    {
      processId,
      dealId,
      docs,
    }: { processId: string; dealId: string; docs: IProductData[] },
    { models }: IContext,
  ) {
    return createProductsData({ models, processId, dealId, docs });
  },

  async cpDealsEditProductData(
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
        { new: true },
      )) || ({} as any);

    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal: deal,
    });

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
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');
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

    const updatedItem =
      (await models.Deals.findOneAndUpdate(
        { _id: dealId },
        {
          $set: {
            productsData,
            ...(await getTotalAmounts(productsData)),
          },
        },
        { new: true },
      )) || ({} as any);

    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal: deal,
    });

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

dealMutations.cpDealsEdit.wrapperConfig = {
  forClientPortal: true,
};
dealMutations.cpDealsChange.wrapperConfig = {
  forClientPortal: true,
};
dealMutations.cpDealsCreateProductsData.wrapperConfig = {
  forClientPortal: true,
};
dealMutations.cpDealsEditProductData.wrapperConfig = {
  forClientPortal: true,
};
