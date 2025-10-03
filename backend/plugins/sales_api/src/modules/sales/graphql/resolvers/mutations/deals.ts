import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IDeal, IDealDocument, IProductData } from '~/modules/sales/@types';
import { SALES_STATUSES } from '~/modules/sales/constants';
import {
  checkMovePermission,
  createConformity,
  destroyBoardItemRelations,
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

export const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(
    _root,
    doc: IDeal & { processId: string; aboveItemId: string },
    { user, models }: IContext,
  ) {
    return await addDeal({ models, user, doc });
  },

  /**
   * Edits a deal
   */
  async dealsEdit(
    _root,
    { _id, processId, ...doc }: IDealDocument & { processId: string },
    { user, models }: IContext,
  ) {
    return await editDeal({ models, _id, processId, doc, user });
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
    { user, models }: IContext,
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
  async dealsRemove(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    const item = await models.Deals.findOne({ _id });

    if (!item) {
      throw new Error('Deal not found');
    }

    // await sendNotifications(models, subdomain, {
    //   item,
    //   user,
    //   type: `${type}Delete`,
    //   action: `deleted ${type}:`,
    //   content: `'${item.name}'`,
    //   contentType: type,
    // });

    // if (item?.assignedUserIds && item?.assignedUserIds?.length > 0) {
    //   sendCoreMessage({
    //     subdomain: 'os',
    //     action: 'sendMobileNotification',
    //     data: {
    //       title: `${item.name}`,
    //       body: `${
    //         user?.details?.fullName || user?.details?.shortName
    //       } deleted the ${type}`,
    //       receivers: item?.assignedUserIds,
    //       data: {
    //         type,
    //         id: item._id,
    //       },
    //     },
    //   });
    // }

    await destroyBoardItemRelations(models, item._id);

    const removed = await models.Deals.findOneAndDelete({ _id: item._id });

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
    { user, models }: IContext,
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

    const companyIds = await getCompanyIds('deal', _id);
    const customerIds = await getCustomerIds('deal', _id);

    await createConformity({
      mainType: 'deal',
      mainTypeId: clone._id,
      customerIds,
      companyIds,
    });

    await copyChecklists(models, {
      contentType: 'deal',
      contentTypeId: item._id,
      targetContentId: clone._id,
      user,
    });

    // order notification
    // const stage = await models.Stages.getStage(clone.stageId);

    // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //   salesPipelinesChanged: {
    //     _id: stage.pipelineId,
    //     processId,
    //     action: 'itemAdd',
    //     data: {
    //       item: {
    //         ...clone._doc,
    //         ...(await itemResolver(models, subdomain, user, type, clone)),
    //       },
    //       aboveItemId: _id,
    //       destinationStageId: stage._id,
    //     },
    //   },
    // });

    // await publishHelperItemsConformities(clone, stage);

    return clone;
  },

  async dealsArchive(
    _root,
    { stageId, processId }: { stageId: string; processId: string },
    { user, models }: IContext,
  ) {
    // const items = await models.Deals.find({
    //   stageId,
    //   status: { $ne: SALES_STATUSES.ARCHIVED },
    // }).lean();

    await models.Deals.updateMany(
      { stageId },
      { $set: { status: SALES_STATUSES.ARCHIVED } },
    );

    // order notification
    // const stage = await models.Stages.getStage(stageId);

    // for (const item of items) {
    //   await putActivityLog(subdomain, {
    //     action: 'createArchiveLog',
    //     data: {
    //       item,
    //       contentType: type,
    //       action: 'archive',
    //       userId: user._id,
    //       createdBy: user._id,
    //       contentId: item._id,
    //       content: 'archived',
    //     },
    //   });

    //   graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //     salesPipelinesChanged: {
    //       _id: stage.pipelineId,
    //       processId,
    //       action: 'itemsRemove',
    //       data: {
    //         item,
    //         destinationStageId: stage._id,
    //       },
    //     },
    //   });
    // }

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
      (doc) => ({ ...doc, tickUsed } as IProductData),
    );
    const productsData: IProductData[] = (deal.productsData || []).concat(
      addDocs,
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

    const updatedItem =
      (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    const dataIds = (updatedItem.productsData || [])
      .filter((pd) => !oldDataIds.includes(pd._id))
      .map((pd) => pd._id);

    // graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
    //   salesProductsDataChanged: {
    //     _id: dealId,
    //     processId,
    //     action: 'create',
    //     data: {
    //       dataIds,
    //       docs,
    //       productsData,
    //     },
    //   },
    // });

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

    const productsData: IProductData[] = (deal.productsData || []).map((data) =>
      data._id === dataId ? { ...doc } : data,
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

    // graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
    //   salesProductsDataChanged: {
    //     _id: dealId,
    //     processId,
    //     action: 'edit',
    //     data: {
    //       dataId,
    //       doc,
    //       productsData,
    //     },
    //   },
    // });

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
      dataId,
    }: {
      processId: string;
      dealId: string;
      dataId: string;
    },
    { models, user }: IContext,
  ) {
    const deal = await models.Deals.getDeal(dealId);

    const oldPData = (deal.productsData || []).find(
      (pdata) => pdata._id === dataId,
    );

    if (!oldPData) {
      throw new Error('Deals productData not found');
    }

    const productsData = (deal.productsData || []).filter(
      (data) => data._id !== dataId,
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

    // graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
    //   salesProductsDataChanged: {
    //     _id: dealId,
    //     processId,
    //     action: 'delete',
    //     data: {
    //       dataId,
    //       productsData,
    //     },
    //   },
    // });

    return {
      dataId,
      productsData,
    };
  },
};
