import { canGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { checkUserIds, graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal, IProductData } from '~/modules/sales/@types';
import {
  checkMovePermission,
  createRelations,
  getNewOrder,
  getTotalAmounts,
  sendNotifications,
} from '~/modules/sales/utils';
import {
  changeItemStatus,
  checkAssignedUserFromPData,
  copyPipelineLabels,
  itemMover,
  subscriptionWrapper,
} from '../utils';
import {
  checkLoyalties,
  checkPricing,
  confirmLoyalties,
  doScoreCampaign,
} from './loyaltyUtils';

export const addDeal = async ({
  models,
  subdomain,
  doc,
  user,
}: {
  models: IModels;
  subdomain: string;
  doc: IDeal & { processId: string; aboveItemId: string };
  user: IUserDocument;
}) => {
  doc.initialStageId = doc.stageId;
  doc.watchedUserIds = user && [user._id];

  const extendedDoc = {
    ...doc,
    modifiedBy: user?._id,
    userId: user ? user._id : doc.userId,
    order: await getNewOrder({
      collection: models.Deals,
      stageId: doc.stageId,
      aboveItemId: doc.aboveItemId,
    }),
  };

  if (extendedDoc.propertiesData) {
    // clean custom field values
    extendedDoc.propertiesData = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: extendedDoc.propertiesData,
      defaultValue: {},
    });
  }

  const deal = await models.Deals.createDeal(extendedDoc);

  const stage = await models.Stages.getStage(deal.stageId);

  await createRelations(subdomain, {
    dealId: deal._id,
    companyIds: doc.companyIds,
    customerIds: doc.customerIds,
  });

  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  await sendNotifications(models, subdomain, {
    item: deal,
    user,
    action: `invited you to the ${pipeline.name}`,
    content: `'${deal.name}'.`,
  });

  await subscriptionWrapper(models, {
    action: 'create',
    deal,
    pipelineId: stage.pipelineId,
  });
  return deal;
};

export const editDeal = async ({
  user,
  models,
  subdomain,
  _id,
  processId,
  doc,
}: {
  models: IModels;
  subdomain: string;
  _id: string;
  doc: IDeal;
  processId: string;
  user: IUserDocument;
}) => {
  const oldDeal = await models.Deals.getDeal(_id);

  if (doc.assignedUserIds) {
    const { removedUserIds } = checkUserIds(
      oldDeal.assignedUserIds,
      doc.assignedUserIds,
    );
    const oldAssignedUserPdata = (oldDeal.productsData || [])
      .filter((pdata) => pdata.assignUserId)
      .map((pdata) => pdata.assignUserId || '');
    const cantRemoveUserIds = removedUserIds.filter((userId) =>
      oldAssignedUserPdata.includes(userId),
    );

    if (cantRemoveUserIds.length > 0) {
      throw new Error(
        'Cannot remove the team member, it is assigned in the product / service section',
      );
    }
  }

  if (doc.productsData) {
    const { assignedUserIds } = checkAssignedUserFromPData(
      oldDeal.assignedUserIds,
      doc.productsData
        .filter((pdata) => pdata.assignUserId)
        .map((pdata) => pdata.assignUserId || ''),
      oldDeal.productsData,
    );

    doc.assignedUserIds = assignedUserIds;

    doc.productsData = await checkLoyalties(subdomain, _id, {
      ...oldDeal.toObject?.(),
      ...oldDeal,
      ...doc,
    });

    doc.productsData = await checkPricing(subdomain, models, {
      ...oldDeal.toObject?.(),
      ...oldDeal,
      ...doc,
    });
  }

  const extendedDoc = {
    ...doc,
    modifiedAt: new Date(),
    modifiedBy: user._id,
  };

  const stage = await models.Stages.getStage(oldDeal.stageId);

  const { canEditMemberIds } = stage;

  if (
    canEditMemberIds &&
    canEditMemberIds.length > 0 &&
    !canEditMemberIds.includes(user._id)
  ) {
    throw new Error('Permission denied');
  }

  if (
    doc.status === 'archived' &&
    oldDeal.status === 'active' &&
    !(await canGroup(subdomain, 'dealsArchive', user))
  ) {
    throw new Error('Permission denied');
  }

  if (extendedDoc.propertiesData) {
    // clean custom field values
    extendedDoc.propertiesData = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: extendedDoc.propertiesData,
      defaultValue: {},
    });
  }

  const updatedItem = await models.Deals.updateDeal(_id, extendedDoc);
  // labels should be copied to newly moved pipeline
  if (updatedItem.stageId !== oldDeal.stageId) {
    await copyPipelineLabels(models, { item: oldDeal, doc, user });
  }

  // const notificationDoc: IBoardNotificationParams = {
  const notificationDoc: any = {
    item: updatedItem,
    user,
    type: `dealEdit`,
    contentType: 'deal',
  };

  if (doc.status && oldDeal.status && oldDeal.status !== doc.status) {
    const activityAction = doc.status === 'active' ? 'activated' : 'archived';

    // order notification
    await changeItemStatus(models, user, {
      item: updatedItem,
      oldDeal,
      status: activityAction,
      processId,
      stage,
    });
  }

  if (doc.assignedUserIds) {
    const { addedUserIds, removedUserIds } = checkUserIds(
      oldDeal.assignedUserIds,
      doc.assignedUserIds,
    );

    notificationDoc.invitedUsers = addedUserIds;
    notificationDoc.removedUsers = removedUserIds;
  }

  await sendNotifications(models, subdomain, notificationDoc);

  // exclude [null]
  if (doc.tagIds?.length) {
    doc.tagIds = doc.tagIds.filter((ti) => ti);
  }

  const transitionedToArchived =
    doc.status === 'archived' &&
    !!oldDeal.status &&
    oldDeal.status !== doc.status;

  if (!transitionedToArchived) {
    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal,
      pipelineId: stage.pipelineId,
    });
  }

  await doScoreCampaign(subdomain, models, _id, updatedItem, oldDeal);
  await confirmLoyalties(subdomain, _id, updatedItem);

  if (oldDeal.stageId === updatedItem.stageId) {
    return updatedItem;
  }

  // if task moves between stages
  await itemMover(models, user._id, oldDeal, updatedItem.stageId);

  return updatedItem;
};

export const changeDeal = async (
  subdomain: string,
  models: IModels,
  userId: string,
  {
    itemId,
    aboveItemId,
    destinationStageId,
  }: {
    itemId: string;
    aboveItemId?: string;
    destinationStageId: string;
  },
) => {
  const item = await models.Deals.findOne({ _id: itemId });

  if (!item) {
    throw new Error('Deal not found');
  }

  const stage = await models.Stages.getStage(item.stageId);

  const extendedDoc: IDeal = {
    modifiedBy: userId,
    stageId: destinationStageId,
    order: await getNewOrder({
      collection: models.Deals,
      stageId: destinationStageId,
      aboveItemId,
    }),
  };

  if (item.stageId !== destinationStageId) {
    checkMovePermission(stage, userId);

    const destinationStage = await models.Stages.getStage(destinationStageId);

    checkMovePermission(destinationStage, userId);

    extendedDoc.stageChangedDate = new Date();
  }

  const updatedItem = await models.Deals.updateDeal(itemId, extendedDoc);

  if (item.stageId !== destinationStageId) {
    await doScoreCampaign(subdomain, models, item._id, updatedItem, item);
    await confirmLoyalties(subdomain, item._id, updatedItem);
  }

  await itemMover(models, userId, item, destinationStageId);

  await subscriptionWrapper(models, {
    action: 'update',
    deal: updatedItem,
    oldDeal: item,
    pipelineId: stage.pipelineId,
  });

  return updatedItem;
};

export const createProductsData = async ({
  models,
  processId,
  dealId,
  docs,
}: {
  models: IModels;
  processId: string;
  dealId: string;
  docs: IProductData[];
}) => {
  const deal = await models.Deals.getDeal(dealId);
  const stage = await models.Stages.getStage(deal.stageId);

  const oldDataIds = (deal.productsData || []).map((pd) => pd._id);

  const { assignedUserIds } = checkAssignedUserFromPData(
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
      const checkDup = (deal.productsData || []).find((pd) => pd._id === doc._id);
      if (checkDup) {
        throw new Error('Deals productData duplicated');
      }
    }
  }

  // undefined or null then true
  const tickUsed = !(stage.defaultTick === false);
  const addDocs = (docs || []).map((doc) => ({ ...doc, tickUsed } as IProductData));
  const productsData: IProductData[] = (deal.productsData || []).concat(addDocs);

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

  return { dataIds, productsData };
};
