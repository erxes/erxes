import { getNewOrder } from '../models/utils';
import { NOTIFICATION_TYPES } from '../models/definitions/constants';
import { IDealDocument } from '../models/definitions/deals';
import { IGrowthHackDocument } from '../models/definitions/growthHacks';
import { ITaskDocument } from '../models/definitions/tasks';
import { IPurchaseDocument } from '../models/definitions/purchases';
import { ITicketDocument } from '../models/definitions/tickets';
import { can, checkLogin } from '@erxes/api-utils/src';
import * as _ from 'underscore';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { sendCoreMessage, sendNotificationsMessage } from '../messageBroker';
import { IModels } from '../connectionResolver';

interface IMainType {
  mainType: string;
  mainTypeId: string;
}

export interface IConformityAdd extends IMainType {
  relType: string;
  relTypeId: string;
}

interface IConformityCreate extends IMainType {
  companyIds?: string[];
  customerIds?: string[];
}

/**
 * Send a notification
 */
export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: 'send', data });
};

export const notifiedUserIds = async (models: IModels, item: any) => {
  let userIds: string[] = [];

  userIds = userIds.concat(item.assignedUserIds || []);

  userIds = userIds.concat(item.watchedUserIds || []);

  const stage = await models.Stages.getStage(item.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  userIds = userIds.concat(pipeline.watchedUserIds || []);

  return userIds;
};

export interface IBoardNotificationParams {
  item: IDealDocument | IPurchaseDocument;
  user: IUserDocument;
  type: string;
  action?: string;
  content?: string;
  contentType: string;
  invitedUsers?: string[];
  removedUsers?: string[];
}

/**
 * Send notification to all members of this content except the sender
 */
export const sendNotifications = async (
  models: IModels,
  subdomain: string,
  {
    item,
    user,
    type,
    action,
    content,
    contentType,
    invitedUsers,
    removedUsers
  }: IBoardNotificationParams
) => {
  const stage = await models.Stages.getStage(item.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  const title = `${contentType} updated`;

  if (!content) {
    content = `${contentType} '${item.name}'`;
  }

  const usersToExclude = [
    ...(removedUsers || []),
    ...(invitedUsers || []),
    user._id
  ];

  const notificationDoc = {
    createdUser: user,
    title,
    contentType,
    contentTypeId: item._id,
    notifType: type,
    action: action ? action : `has updated ${contentType}`,
    content,
    link: `/${contentType}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${item._id}`,

    // exclude current user, invited user and removed users
    receivers: (await notifiedUserIds(models, item)).filter(id => {
      return usersToExclude.indexOf(id) < 0;
    })
  };

  if (removedUsers && removedUsers.length > 0) {
    sendNotification(subdomain, {
      ...notificationDoc,
      notifType:
        NOTIFICATION_TYPES[`${contentType.toUpperCase()}_REMOVE_ASSIGN`],
      action: `removed you from ${contentType}`,
      content: `'${item.name}'`,
      receivers: removedUsers.filter(id => id !== user._id)
    });

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${item.name}`,
        body: `${notificationDoc.createdUser?.details?.fullName ||
          notificationDoc.createdUser?.details
            ?.shortName} removed you from ${contentType}`,
        receivers: removedUsers.filter(id => id !== user._id),
        data: {
          type: contentType,
          id: item._id
        }
      }
    });
  }

  if (invitedUsers && invitedUsers.length > 0) {
    sendNotification(subdomain, {
      ...notificationDoc,
      notifType: NOTIFICATION_TYPES[`${contentType.toUpperCase()}_ADD`],
      action: `invited you to the ${contentType}: `,
      content: `'${item.name}'`,
      receivers: invitedUsers.filter(id => id !== user._id)
    });

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${item.name}`,
        body: `${notificationDoc.createdUser?.details?.fullName ||
          notificationDoc.createdUser?.details
            ?.shortName} invited you to the ${contentType}`,
        receivers: invitedUsers.filter(id => id !== user._id),
        data: {
          type: contentType,
          id: item._id
        }
      }
    });
  }

  sendNotification(subdomain, {
    ...notificationDoc
  });
};

export const boardId = async (models: IModels, item: any) => {
  const stage = await models.Stages.getStage(item.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
  const board = await models.Boards.getBoard(pipeline.boardId);

  return board._id;
};

const PERMISSION_MAP = {
  deal: {
    boardsAdd: 'dealBoardsAdd',
    boardsEdit: 'dealBoardsEdit',
    boardsRemove: 'dealBoardsRemove',
    pipelinesAdd: 'dealPipelinesAdd',
    pipelinesEdit: 'dealPipelinesEdit',
    pipelinesRemove: 'dealPipelinesRemove',
    pipelinesArchive: 'dealPipelinesArchive',
    pipelinesCopied: 'dealPipelinesCopied',
    pipelinesWatch: 'dealPipelinesWatch',
    stagesEdit: 'dealStagesEdit',
    stagesRemove: 'dealStagesRemove',
    itemsSort: 'dealsSort',
    updateTimeTracking: 'dealUpdateTimeTracking'
  },
  ticket: {
    boardsAdd: 'ticketBoardsAdd',
    boardsEdit: 'ticketBoardsEdit',
    boardsRemove: 'ticketBoardsRemove',
    pipelinesAdd: 'ticketPipelinesAdd',
    pipelinesEdit: 'ticketPipelinesEdit',
    pipelinesRemove: 'ticketPipelinesRemove',
    pipelinesArchive: 'ticketPipelinesArchive',
    pipelinesCopied: 'ticketPipelinesCopied',
    pipelinesWatch: 'ticketPipelinesWatch',
    stagesEdit: 'ticketStagesEdit',
    stagesRemove: 'ticketStagesRemove',
    itemsSort: 'ticketsSort',
    updateTimeTracking: 'ticketUpdateTimeTracking'
  },
  task: {
    boardsAdd: 'taskBoardsAdd',
    boardsEdit: 'taskBoardsEdit',
    boardsRemove: 'taskBoardsRemove',
    pipelinesAdd: 'taskPipelinesAdd',
    pipelinesEdit: 'taskPipelinesEdit',
    pipelinesRemove: 'taskPipelinesRemove',
    pipelinesArchive: 'taskPipelinesArchive',
    pipelinesCopied: 'taskPipelinesCopied',
    pipelinesWatch: 'taskPipelinesWatch',
    stagesEdit: 'taskStagesEdit',
    stagesRemove: 'taskStagesRemove',
    itemsSort: 'tasksSort',
    updateTimeTracking: 'taskUpdateTimeTracking'
  },
  growthHack: {
    boardsAdd: 'growthHackBoardsAdd',
    boardsEdit: 'growthHackBoardsEdit',
    boardsRemove: 'growthHackBoardsRemove',
    pipelinesAdd: 'growthHackPipelinesAdd',
    pipelinesEdit: 'growthHackPipelinesEdit',
    pipelinesRemove: 'growthHackPipelinesRemove',
    pipelinesArchive: 'growthHackPipelinesArchive',
    pipelinesCopied: 'growthHackPipelinesCopied',
    pipelinesWatch: 'growthHackPipelinesWatch',
    stagesEdit: 'growthHackStagesEdit',
    templatesAdd: 'growthHackTemplatesAdd',
    templatesEdit: 'growthHackTemplatesEdit',
    templatesRemove: 'growthHackTemplatesRemove',
    templatesDuplicate: 'growthHackTemplatesDuplicate',
    showTemplates: 'showGrowthHackTemplates',
    stagesRemove: 'growthHackStagesRemove',
    itemsSort: 'growthHacksSort'
  },
  purchase: {
    boardsAdd: 'purchaseBoardsAdd',
    boardsEdit: 'purchaseBoardsEdit',
    boardsRemove: 'purchaseBoardsRemove',
    pipelinesAdd: 'purchasePipelinesAdd',
    pipelinesEdit: 'purchasePipelinesEdit',
    pipelinesRemove: 'purchasePipelinesRemove',
    pipelinesArchive: 'purchasePipelinesArchive',
    pipelinesCopied: 'purchasePipelinesCopied',
    pipelinesWatch: 'purchasePipelinesWatch',
    stagesEdit: 'purchaseStagesEdit',
    stagesRemove: 'purchaseStagesRemove',
    itemsSort: 'purchasesSort',
    updateTimeTracking: 'purchaseUpdateTimeTracking'
  }
};

export const checkPermission = async (
  _models: IModels,
  subdomain: string,
  type: string,
  user: IUserDocument,
  mutationName: string
) => {
  checkLogin(user);

  const actionName = PERMISSION_MAP[type][mutationName];

  let allowed = await can(subdomain, actionName, user);

  if (user.isOwner) {
    allowed = true;
  }

  if (!allowed) {
    throw new Error('Permission required');
  }

  return;
};

export const createConformity = async (
  subdomain: string,
  { companyIds, customerIds, mainType, mainTypeId }: IConformityCreate
) => {
  const companyConformities: IConformityAdd[] = (companyIds || []).map(
    companyId => ({
      mainType,
      mainTypeId,
      relType: 'company',
      relTypeId: companyId
    })
  );

  const customerConformities: IConformityAdd[] = (customerIds || []).map(
    customerId => ({
      mainType,
      mainTypeId,
      relType: 'customer',
      relTypeId: customerId
    })
  );

  const allConformities = companyConformities.concat(customerConformities);

  sendCoreMessage({
    subdomain,
    action: 'conformities.addConformities',
    data: allConformities
  });
};

interface ILabelParams {
  item: IDealDocument | ITaskDocument | ITicketDocument | IPurchaseDocument;
  doc: any;
  user: IUserDocument;
}

/**
 * Copies pipeline labels alongside deal/task/tickets/purchase when they are moved between different pipelines.
 */
export const copyPipelineLabels = async (
  models: IModels,
  params: ILabelParams
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
    _id: { $in: item.labelIds }
  }).lean();

  const updatedLabelIds: string[] = [];

  const existingLabels = await models.PipelineLabels.find({
    name: { $in: oldLabels.map(o => o.name) },
    colorCode: { $in: oldLabels.map(o => o.colorCode) },
    pipelineId: newStage.pipelineId
  }).lean();

  // index using only name and colorCode, since all pipelineIds are same
  const existingLabelsByUnique = _.indexBy(
    existingLabels,
    ({ name, colorCode }) => JSON.stringify({ name, colorCode })
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
        createdBy: user._id
      });
    } else {
      updatedLabelIds.push(exists._id);
    }
  } // end label loop

  // Insert labels that don't already exist on the new stage's pipeline
  const newLabels = await models.PipelineLabels.insertMany(notExistingLabels, {
    ordered: false
  });

  for (const newLabel of newLabels) {
    updatedLabelIds.push(newLabel._id);
  }

  await models.PipelineLabels.labelsLabel(
    newStage.pipelineId,
    item._id,
    updatedLabelIds
  );
};

interface IChecklistParams {
  contentType: string;
  contentTypeId: string;
  targetContentId: string;
  user: IUserDocument;
}

/**
 * Copies checklists of board item
 */
export const copyChecklists = async (
  models: IModels,
  params: IChecklistParams
) => {
  const { contentType, contentTypeId, targetContentId, user } = params;

  const originalChecklists = await models.Checklists.find({
    contentType,
    contentTypeId
  }).lean();

  const clonedChecklists = await models.Checklists.insertMany(
    originalChecklists.map(originalChecklist => ({
      contentType,
      contentTypeId: targetContentId,
      title: originalChecklist.title,
      createdUserId: user._id,
      createdDate: new Date()
    })),
    { ordered: true }
  );

  const originalChecklistIdToClonedId = new Map<string, string>();

  for (let i = 0; i < originalChecklists.length; i++) {
    originalChecklistIdToClonedId.set(
      originalChecklists[i]._id,
      clonedChecklists[i]._id
    );
  }

  const originalChecklistItems = await models.ChecklistItems.find({
    checklistId: { $in: originalChecklists.map(x => x._id) }
  }).lean();

  await models.ChecklistItems.insertMany(
    originalChecklistItems.map(({ content, order, checklistId }) => ({
      checklistId: originalChecklistIdToClonedId.get(checklistId),
      isChecked: false,
      createdUserId: user._id,
      createdDate: new Date(),
      content,
      order
    })),
    { ordered: false }
  );
};

export const prepareBoardItemDoc = async (
  item:
    | IDealDocument
    | ITaskDocument
    | ITicketDocument
    | IGrowthHackDocument
    | IPurchaseDocument,
  collection: string,
  userId: string
) => {
  const doc = {
    ...item,
    _id: undefined,
    userId,
    modifiedBy: userId,
    watchedUserIds: [userId],
    assignedUserIds: item.assignedUserIds,
    name: `${item.name}-copied`,
    initialStageId: item.initialStageId,
    stageId: item.stageId,
    description: item.description,
    priority: item.priority,
    labelIds: item.labelIds,
    order: await getNewOrder({
      collection,
      stageId: item.stageId,
      aboveItemId: item._id
    }),

    attachments: (item.attachments || []).map(a => ({
      url: a.url,
      name: a.name,
      type: a.type,
      size: a.size
    }))
  };

  return doc;
};
