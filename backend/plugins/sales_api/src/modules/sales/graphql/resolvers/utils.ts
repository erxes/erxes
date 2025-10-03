import { IUserDocument } from 'erxes-api-shared/core-types';
import { checkUserIds, graphqlPubsub } from 'erxes-api-shared/utils';
import { DeleteResult } from 'mongoose';
import * as _ from "underscore";
import { IModels } from "~/connectionResolvers";
import { IDealDocument, IProductData, IStage, IStageDocument } from "~/modules/sales/@types";
import { SALES_STATUSES } from '~/modules/sales/constants';
import { getNewOrder } from '~/modules/sales/utils';

export const subscriptionWrapper = async (
  models: IModels,
  { action, deal, oldDeal, dealId, pipelineId, oldPipelineId }: {
    action: string, deal?: IDealDocument, oldDeal?: IDealDocument, dealId?: string, pipelineId?: string, oldPipelineId?: string
  }
) => {
  const id = deal?._id || dealId;
  await graphqlPubsub.publish(`salesDealChanged:${id}`, {
    salesDealChanged: {
      action,
      deal,
      oldDeal,
    },
  });

  const pipelineIds: string[] = [];

  if (!pipelineId && deal?.stageId) {
    const stage = await models.Stages.findOne({ _id: deal.stageId }).lean();
    pipelineId = stage?.pipelineId
  }

  if (!oldPipelineId && oldDeal?.stageId) {
    const stage = await models.Stages.findOne({ _id: oldDeal.stageId }).lean();
    oldPipelineId = stage?.pipelineId
  }

  if (pipelineId) {
    pipelineIds.push(pipelineId)
  }

  if (oldPipelineId) {
    pipelineIds.push(oldPipelineId)
  }

  await graphqlPubsub.publish('salesDealListChanged', {
    salesDealListChanged: {
      pipelineIds,
      deal,
      oldDeal,
    },
  });
}

/**
 * Copies pipeline labels alongside deal when they are moved between different pipelines.
 */
export const copyPipelineLabels = async (
  models: IModels,
  params: {
    item: IDealDocument;
    doc: any;
    user: IUserDocument;
  },
) => {
  const { item, doc, user } = params;

  const oldStage = await models.Stages.findOne({ _id: item.stageId }).lean();
  const newStage = await models.Stages.findOne({ _id: doc.stageId }).lean();

  if (!(oldStage && newStage)) {
    throw new Error('Stage not found');
  }

  if (oldStage.pipelineId === newStage.pipelineId) {
    return;
  }

  const oldLabels = await models.PipelineLabels.find({
    _id: { $in: item.labelIds },
  }).lean();

  const updatedLabelIds: string[] = [];

  const existingLabels = await models.PipelineLabels.find({
    name: { $in: oldLabels.map((o) => o.name) },
    colorCode: { $in: oldLabels.map((o) => o.colorCode) },
    pipelineId: newStage.pipelineId,
  }).lean();

  // index using only name and colorCode, since all pipelineIds are same
  const existingLabelsByUnique = _.indexBy(
    existingLabels,
    ({ name, colorCode }) => JSON.stringify({ name, colorCode }),
  );

  // Collect labels that don't exist on the new stage's pipeline here
  const notExistingLabels: any[] = [];

  for (const label of oldLabels) {
    const exists =
      existingLabelsByUnique[
      JSON.stringify({ name: label.name, colorCode: label.colorCode })
      ];
    if (!exists) {
      notExistingLabels.push({
        name: label.name,
        colorCode: label.colorCode,
        pipelineId: newStage.pipelineId,
        createdAt: new Date(),
        createdBy: user._id,
      });
    } else {
      updatedLabelIds.push(exists._id);
    }
  } // end label loop

  // Insert labels that don't already exist on the new stage's pipeline
  const newLabels = await models.PipelineLabels.insertMany(notExistingLabels, {
    ordered: false,
  });

  for (const newLabel of newLabels) {
    updatedLabelIds.push(newLabel._id);
  }

  await models.PipelineLabels.labelsLabel(item._id, updatedLabelIds);
};

export const itemMover = async (
  models: IModels,
  userId: string,
  item: IDealDocument,
  destinationStageId: string,
) => {
  const oldStageId = item.stageId;

  let action = `changed order of your deal:`;
  let content = `'${item.name}'`;

  if (oldStageId !== destinationStageId) {
    const stage = await models.Stages.getStage(destinationStageId);
    const oldStage = await models.Stages.getStage(oldStageId);

    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const oldPipeline = await models.Pipelines.getPipeline(oldStage.pipelineId);

    const board = await models.Boards.getBoard(pipeline.boardId);
    const oldBoard = await models.Boards.getBoard(oldPipeline.boardId);

    action = `moved '${item.name}' from ${oldBoard.name}-${oldPipeline.name}-${oldStage.name} to `;

    content = `${board.name}-${pipeline.name}-${stage.name}`;

    // const link = `/${contentType}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${item._id}`;

    // const activityLogContent = {
    //   oldStageId,
    //   destinationStageId,
    //   text: `${oldStage.name} to ${stage.name}`,
    // };

    // await putActivityLog(subdomain, {
    //   action: "createBoardItemMovementLog",
    //   data: {
    //     item,
    //     contentType,
    //     userId,
    //     activityLogContent,
    //     link,
    //     action: "moved",
    //     contentId: item._id,
    //     createdBy: userId,
    //     content: activityLogContent,
    //   },
    // });

    // sendNotificationsMessage({
    //   subdomain,
    //   action: "batchUpdate",
    //   data: {
    //     selector: { contentType, contentTypeId: item._id },
    //     modifier: { $set: { link } },
    //   },
    // });
  }

  return { content, action };
};

/**
 * Copies checklists of board item
 */
export const copyChecklists = async (
  models: IModels,
  params: {
    contentType: string;
    contentTypeId: string;
    targetContentId: string;
    user: IUserDocument;
  },
) => {
  const { contentType, contentTypeId, targetContentId, user } = params;

  const originalChecklists = await models.Checklists.find({
    contentType,
    contentTypeId,
  }).lean();

  const clonedChecklists = await models.Checklists.insertMany(
    originalChecklists.map((originalChecklist) => ({
      contentType,
      contentTypeId: targetContentId,
      title: originalChecklist.title,
      createdUserId: user._id,
      createdDate: new Date(),
    })),
    { ordered: true },
  );

  const originalChecklistIdToClonedId = new Map<string, string>();

  for (let i = 0; i < originalChecklists.length; i++) {
    originalChecklistIdToClonedId.set(
      originalChecklists[i]._id,
      clonedChecklists[i]._id,
    );
  }

  const originalChecklistItems = await models.ChecklistItems.find({
    checklistId: { $in: originalChecklists.map((x) => x._id) },
  }).lean();

  await models.ChecklistItems.insertMany(
    originalChecklistItems.map(({ content, order, checklistId }) => ({
      checklistId: originalChecklistIdToClonedId.get(checklistId),
      isChecked: false,
      createdUserId: user._id,
      createdDate: new Date(),
      content,
      order,
    })),
    { ordered: false },
  );
};

export const createOrUpdatePipelineStages = async (
  models: IModels,
  stages: IStageDocument[],
  pipelineId: string,
): Promise<DeleteResult> => {
  let order = 0;

  const validStageIds: string[] = [];
  const bulkOpsPrevEntry: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: IStage };
    };
  }> = [];
  const prevItemIds = stages.map((stage) => stage._id);
  // fetch stage from database
  const prevEntries = await models.Stages.find({ _id: { $in: prevItemIds } });
  const prevEntriesIds = prevEntries.map((entry) => entry._id);

  await removeStageWithItems(models, pipelineId, prevItemIds);

  for (const stage of stages) {
    order++;

    const doc: any = { ...stage, order, pipelineId };

    const _id = doc._id;

    const prevEntry = prevEntriesIds.includes(_id);

    // edit
    if (prevEntry) {
      validStageIds.push(_id);

      bulkOpsPrevEntry.push({
        updateOne: {
          filter: {
            _id,
          },
          update: {
            $set: doc,
          },
        },
      });
      // create
    } else {
      delete doc._id;
      const createdStage = await models.Stages.createStage(doc);
      validStageIds.push(createdStage._id);
    }
  }

  if (bulkOpsPrevEntry.length > 0) {
    await models.Stages.bulkWrite(bulkOpsPrevEntry);
  }

  return models.Stages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
};

export const removeStageItems = async (models: IModels, stageId: string) => {
  await removeItems(models, [stageId]);
};

export const removeStageWithItems = async (
  models: IModels,
  pipelineId: string,
  prevItemIds: string[] = [],
): Promise<DeleteResult> => {
  const selector = { pipelineId, _id: { $nin: prevItemIds } };

  const stageIds = await models.Stages.find(selector).distinct('_id');

  await models.Deals.deleteMany({ stageId: { $in: stageIds } });

  return models.Stages.deleteMany(selector);
};

export const removeItems = async (models: IModels, stageIds: string[]) => {
  const items = await models.Deals.find(
    { stageId: { $in: stageIds } },
    { _id: 1 },
  );

  const itemIds = items.map((i) => i._id);

  await models.Checklists.removeChecklists(itemIds);

  //   await sendCoreMessage({
  //     subdomain,
  //     action: "conformities.removeConformities",
  //     data: {
  //       mainType: type,
  //       mainTypeIds: itemIds
  //     }
  //   });

  //   await sendCoreMessage({
  //     subdomain,
  //     action: "removeInternalNotes",
  //     data: { contentType: `sales:${type}`, contentTypeIds: itemIds }
  //   });

  await models.Deals.deleteMany({ stageId: { $in: stageIds } });
};

export const removePipelineStagesWithItems = async (
  models: IModels,
  pipelineId: string,
): Promise<DeleteResult> => {
  const stageIds = await models.Stages.find({ pipelineId })
    .distinct('_id')
    .lean();

  await removeItems(models, stageIds);

  return await models.Stages.deleteMany({ pipelineId });
};

export const changeItemStatus = async (
  models: IModels,
  user: any,
  {
    item,
    status,
    processId,
    stage,
  }: {
    item: any;
    status: string;
    processId: string;
    stage: IStageDocument;
  },
) => {
  if (status === 'archived') {
    // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
    //   salesPipelinesChanged: {
    //     _id: stage.pipelineId,
    //     processId,
    //     action: "itemRemove",
    //     data: {
    //       item,
    //       oldStageId: item.stageId,
    //     },
    //   },
    // });

    return;
  }

  const aboveItems = await models.Deals.find({
    stageId: item.stageId,
    status: { $ne: SALES_STATUSES.ARCHIVED },
    order: { $lt: item.order },
  })
    .sort({ order: -1 })
    .limit(1);

  const aboveItemId = aboveItems[0]?._id || '';

  // maybe, recovered order includes to oldOrders
  await models.Deals.updateOne(
    {
      _id: item._id,
    },
    {
      order: await getNewOrder({
        collection: models.Deals,
        stageId: item.stageId,
        aboveItemId,
      }),
    },
  );

  // graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
  //   salesPipelinesChanged: {
  //     _id: stage.pipelineId,
  //     processId,
  //     action: "itemAdd",
  //     data: {
  //       item: {
  //         ...item._doc,
  //         ...(await itemResolver(models, subdomain, user, type, item)),
  //       },
  //       aboveItemId,
  //       destinationStageId: item.stageId,
  //     },
  //   },
  // });
};

export const checkAssignedUserFromPData = (
  oldAllUserIds?: string[],
  assignedUsersPdata?: string[],
  oldPData?: IProductData[]
) => {
  let assignedUserIds = oldAllUserIds || [];

  const oldAssignedUserPdata = (oldPData || [])
    .filter((pdata) => pdata.assignUserId)
    .map((pdata) => pdata.assignUserId || "");

  const { addedUserIds, removedUserIds } = checkUserIds(
    oldAssignedUserPdata,
    assignedUsersPdata
  );

  if (addedUserIds.length > 0 || removedUserIds.length > 0) {
    assignedUserIds = [...new Set(assignedUserIds.concat(addedUserIds))];
    assignedUserIds = assignedUserIds.filter(
      (userId) => !removedUserIds.includes(userId)
    );
  }

  return { assignedUserIds, addedUserIds, removedUserIds };
};
