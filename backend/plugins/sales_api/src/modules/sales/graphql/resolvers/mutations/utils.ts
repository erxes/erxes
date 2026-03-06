import { can } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { checkUserIds, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import {
  createRelations,
  getNewOrder,
  sendNotifications,
} from '~/modules/sales/utils';
import {
  changeItemStatus,
  checkAssignedUserFromPData,
  copyPipelineLabels,
  itemMover,
  subscriptionWrapper,
} from '../utils';

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
    modifiedBy: user && user._id,
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

    // doc.productsData = await checkPricing(subdomain, models, { ...oldDeal, ...doc })
  }

  // await doScoreCampaign(subdomain, models, _id, doc);
  // await confirmLoyalties(subdomain, _id, doc);

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
    !(await can(subdomain, 'dealsArchive', user))
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
  if (doc.tagIds && doc.tagIds.length) {
    doc.tagIds = doc.tagIds.filter((ti) => ti);
  }

  await subscriptionWrapper(models, {
    action: 'update',
    deal: updatedItem,
    oldDeal,
    pipelineId: stage.pipelineId,
  });

  // await doScoreCampaign(subdomain, models, _id, updatedItem);

  if (oldDeal.stageId === updatedItem.stageId) {
    return updatedItem;
  }

  // if task moves between stages
  await itemMover(models, user._id, oldDeal, updatedItem.stageId);

  return updatedItem;
};
