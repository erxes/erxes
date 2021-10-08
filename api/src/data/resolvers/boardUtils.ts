import {
  Boards,
  ChecklistItems,
  Checklists,
  Conformities,
  PipelineLabels,
  Pipelines,
  Stages
} from '../../db/models';
import { getNewOrder } from '../../db/models/boardUtils';
import { IConformityAdd } from '../../db/models/definitions/conformities';
import { NOTIFICATION_TYPES } from '../../db/models/definitions/constants';
import { IDealDocument } from '../../db/models/definitions/deals';
import { IGrowthHackDocument } from '../../db/models/definitions/growthHacks';
import { ITaskDocument } from '../../db/models/definitions/tasks';
import { ITicketDocument } from '../../db/models/definitions/tickets';
import { IUserDocument } from '../../db/models/definitions/users';
import { can } from '../permissions/utils';
import { checkLogin } from '../permissions/wrappers';
import utils from '../utils';
import * as _ from 'underscore';

export const notifiedUserIds = async (item: any) => {
  let userIds: string[] = [];

  userIds = userIds.concat(item.assignedUserIds || []);

  userIds = userIds.concat(item.watchedUserIds || []);

  const stage = await Stages.getStage(item.stageId);
  const pipeline = await Pipelines.getPipeline(stage.pipelineId);

  userIds = userIds.concat(pipeline.watchedUserIds || []);

  return userIds;
};

export interface IBoardNotificationParams {
  item: IDealDocument;
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
export const sendNotifications = async ({
  item,
  user,
  type,
  action,
  content,
  contentType,
  invitedUsers,
  removedUsers
}: IBoardNotificationParams) => {
  const stage = await Stages.getStage(item.stageId);

  const pipeline = await Pipelines.getPipeline(stage.pipelineId);

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
    receivers: (await notifiedUserIds(item)).filter(id => {
      return usersToExclude.indexOf(id) < 0;
    })
  };

  if (removedUsers && removedUsers.length > 0) {
    await utils.sendNotification({
      ...notificationDoc,
      notifType:
        NOTIFICATION_TYPES[`${contentType.toUpperCase()}_REMOVE_ASSIGN`],
      action: `removed you from ${contentType}`,
      content: `'${item.name}'`,
      receivers: removedUsers.filter(id => id !== user._id)
    });
  }

  if (invitedUsers && invitedUsers.length > 0) {
    await utils.sendNotification({
      ...notificationDoc,
      notifType: NOTIFICATION_TYPES[`${contentType.toUpperCase()}_ADD`],
      action: `invited you to the ${contentType}: `,
      content: `'${item.name}'`,
      receivers: invitedUsers.filter(id => id !== user._id)
    });
  }

  await utils.sendNotification({
    ...notificationDoc
  });
};

export const boardId = async (item: any) => {
  const stage = await Stages.getStage(item.stageId);
  const pipeline = await Pipelines.getPipeline(stage.pipelineId);
  const board = await Boards.getBoard(pipeline.boardId);

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
    itemsSort: 'dealsSort'
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
    itemsSort: 'ticketsSort'
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
    itemsSort: 'tasksSort'
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
  }
};

export const checkPermission = async (
  type: string,
  user: IUserDocument,
  mutationName: string
) => {
  checkLogin(user);

  const actionName = PERMISSION_MAP[type][mutationName];

  let allowed = await can(actionName, user);

  if (user.isOwner) {
    allowed = true;
  }

  if (!allowed) {
    throw new Error('Permission required');
  }

  return;
};

export const createConformity = async ({
  companyIds,
  customerIds,
  mainType,
  mainTypeId
}: {
  companyIds?: string[];
  customerIds?: string[];
  mainType: string;
  mainTypeId: string;
}) => {
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

  await Conformities.addConformities(allConformities);
};

interface ILabelParams {
  item: IDealDocument | ITaskDocument | ITicketDocument;
  doc: any;
  user: IUserDocument;
}

/**
 * Copies pipeline labels alongside deal/task/tickets when they are moved between different pipelines.
 */
export const copyPipelineLabels = async (params: ILabelParams) => {
  const { item, doc, user } = params;

  const oldStage = await Stages.findOne({ _id: item.stageId }).lean();
  const newStage = await Stages.findOne({ _id: doc.stageId }).lean();

  if (!(oldStage && newStage)) {
    throw new Error('Stage not found');
  }

  if (oldStage.pipelineId === newStage.pipelineId) {
    return;
  }

  const oldLabels = await PipelineLabels.find({
    _id: { $in: item.labelIds }
  }).lean();
  const updatedLabelIds: string[] = [];

  const existingLabels = await PipelineLabels.find({
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
  const newLabels = await PipelineLabels.insertMany(notExistingLabels, {
    ordered: false
  });

  for (const newLabel of newLabels) {
    updatedLabelIds.push(newLabel._id);
  }

  await PipelineLabels.labelsLabel(
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
export const copyChecklists = async (params: IChecklistParams) => {
  const { contentType, contentTypeId, targetContentId, user } = params;

  const originalChecklists = await Checklists.find({
    contentType,
    contentTypeId
  }).lean();

  const clonedChecklists = await Checklists.insertMany(
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

  const originalChecklistItems = await ChecklistItems.find({
    checklistId: { $in: originalChecklists.map(x => x._id) }
  }).lean();

  await ChecklistItems.insertMany(
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
  item: IDealDocument | ITaskDocument | ITicketDocument | IGrowthHackDocument,
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
