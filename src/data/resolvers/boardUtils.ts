import { Boards, Pipelines, Stages } from '../../db/models';
import { NOTIFICATION_TYPES } from '../../db/models/definitions/constants';
import { IUserDocument } from '../../db/models/definitions/users';
import { can } from '../permissions/utils';
import { checkLogin } from '../permissions/wrappers';
import utils from '../utils';

export const notifiedUserIds = async (item: any) => {
  const userIds: string[] = [];

  if (item.assignedUserIds) {
    userIds.concat(item.assignedUserIds);
  }

  if (item.watchedUserIds) {
    userIds.concat(item.watchedUserIds);
  }

  const stage = await Stages.getStage(item.stageId || '');
  const pipeline = await Pipelines.getPipeline(stage.pipelineId || '');

  if (pipeline.watchedUserIds) {
    userIds.concat(pipeline.watchedUserIds);
  }

  return userIds;
};

/**
 * Send notification to all members of this content except the sender
 */
export const sendNotifications = async (
  stageId: string,
  user: IUserDocument,
  type: string,
  userIds: string[],
  content: string,
  contentType: string,
) => {
  const stage = await Stages.findOne({ _id: stageId });

  if (!stage) {
    throw new Error('Stage not found');
  }

  const pipeline = await Pipelines.findOne({ _id: stage.pipelineId });

  if (!pipeline) {
    throw new Error('Pipeline not found');
  }

  await utils.sendNotification({
    createdUser: user._id,
    notifType: type,
    title: content,
    content,
    link: `/${contentType}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}`,

    // exclude current user
    receivers: userIds.filter(id => id !== user._id),
  });
};

export const manageNotifications = async (collection: any, item: any, user: IUserDocument, type: string) => {
  const { _id } = item;
  const oldItem = await collection.findOne({ _id });

  const oldUserIds = await notifiedUserIds(oldItem);
  const userIds = await notifiedUserIds(item);

  // new assignee users
  const newUserIds = userIds.filter(userId => oldUserIds.indexOf(userId) < 0);

  if (newUserIds.length > 0) {
    await sendNotifications(
      item.stageId || '',
      user,
      NOTIFICATION_TYPES[`${type.toUpperCase()}_ADD`],
      newUserIds,
      `'{userName}' invited you to the ${type}: '${item.name}'.`,
      type,
    );
  }

  // remove from assignee users
  const removedUserIds = oldUserIds.filter(userId => userIds.indexOf(userId) < 0);

  if (removedUserIds.length > 0) {
    await sendNotifications(
      item.stageId || '',
      user,
      NOTIFICATION_TYPES[`${type.toUpperCase()}_REMOVE_ASSIGN`],
      removedUserIds,
      `'{userName}' removed you from ${type}: '${item.name}'.`,
      type,
    );
  }

  // dont assignee change and other edit
  if (removedUserIds.length === 0 && newUserIds.length === 0) {
    await sendNotifications(
      item.stageId || '',
      user,
      NOTIFICATION_TYPES[`${type.toUpperCase()}_EDIT`],
      userIds,
      `'{userName}' edited your ${type} '${item.name}'`,
      type,
    );
  }
};

export const itemsChange = async (collection: any, item: any, type: string, destinationStageId: string) => {
  const oldItem = await collection.findOne({ _id: item._id });
  const oldStageId = oldItem ? oldItem.stageId || '' : '';

  let content = `'{userName}' changed order your ${type}:'${item.name}'`;

  if (oldStageId !== destinationStageId) {
    const stage = await Stages.findOne({ _id: destinationStageId });

    if (!stage) {
      throw new Error('Stage not found');
    }

    content = `'{userName}' moved your ${type} '${item.name}' to the '${stage.name}'.`;
  }

  return content;
};

export const boardId = async (item: any) => {
  const stage = await Stages.findOne({ _id: item.stageId });

  if (!stage) {
    return null;
  }

  const pipeline = await Pipelines.findOne({ _id: stage.pipelineId });

  if (!pipeline) {
    return null;
  }

  const board = await Boards.findOne({ _id: pipeline.boardId });

  if (!board) {
    return null;
  }

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
  },
  ticket: {
    boardsAdd: 'ticketBoardsAdd',
    boardsEdit: 'ticketBoardsEdit',
    boardsRemove: 'ticketBoardsRemove',
    pipelinesAdd: 'ticketPipelinesAdd',
    pipelinesEdit: 'ticketPipelinesEdit',
    pipelinesRemove: 'ticketPipelinesRemove',
  },
  task: {
    boardsAdd: 'taskBoardsAdd',
    boardsEdit: 'taskBoardsEdit',
    boardsRemove: 'taskBoardsRemove',
    pipelinesAdd: 'taskPipelinesAdd',
    pipelinesEdit: 'taskPipelinesEdit',
    pipelinesRemove: 'taskPipelinesRemove',
  },
};

export const checkPermission = async (type: string, user: IUserDocument, mutationName: string) => {
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
