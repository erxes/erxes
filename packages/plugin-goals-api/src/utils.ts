import { sendCommonMessage } from './messageBroker';
import { sendCoreMessage, sendNotificationsMessage } from './messageBroker';
import { generateModels, IModels } from './connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IGoalDocument } from './models/definitions/goals';

export interface IGoalNotificationParams {
  item: IGoalDocument;
  user: IUserDocument;
  type: string;
  action?: string;
  content?: string;
  contentType: string;
  invitedUsers?: string[];
  removedUsers?: string[];
}

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
  }: IGoalNotificationParams
) => {
  console.log(item, 'asdoaksdopasdkopsdopa');
  // const stage = await models.Stages.getStage(item.stageId);
  // const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
  // const title = `${contentType} updated`;
  // if (!content) {
  //   content = `${contentType} '${item.name}'`;
  // }
  // const usersToExclude = [
  //   ...(removedUsers || []),
  //   ...(invitedUsers || []),
  //   user._id
  // ];
  // const notificationDoc = {
  //   createdUser: user,
  //   title,
  //   contentType,
  //   contentTypeId: item._id,
  //   notifType: type,
  //   action: action ? action : `has updated ${contentType}`,
  //   content,
  //   link: `/${contentType}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${item._id}`,
  //   // exclude current user, invited user and removed users
  //   receivers: (await notifiedUserIds(models, item)).filter((id) => {
  //     return usersToExclude.indexOf(id) < 0;
  //   })
  // };
  // if (removedUsers && removedUsers.length > 0) {
  //   sendNotification(subdomain, {
  //     ...notificationDoc,
  //     notifType:
  //       NOTIFICATION_TYPES[`${contentType.toUpperCase()}_REMOVE_ASSIGN`],
  //     action: `removed you from ${contentType}`,
  //     content: `'${item.name}'`,
  //     receivers: removedUsers.filter((id) => id !== user._id)
  //   });
  //   sendCoreMessage({
  //     subdomain: 'os',
  //     action: 'sendMobileNotification',
  //     data: {
  //       title: `${item.name}`,
  //       body: `${notificationDoc.createdUser?.details?.fullName ||
  //         notificationDoc.createdUser?.details
  //           ?.shortName} removed you from ${contentType}`,
  //       receivers: removedUsers.filter((id) => id !== user._id),
  //       data: {
  //         type: contentType,
  //         id: item._id
  //       }
  //     }
  //   });
  // }
  // if (invitedUsers && invitedUsers.length > 0) {
  //   sendNotification(subdomain, {
  //     ...notificationDoc,
  //     notifType: NOTIFICATION_TYPES[`${contentType.toUpperCase()}_ADD`],
  //     action: `invited you to the ${contentType}: `,
  //     content: `'${item.name}'`,
  //     receivers: invitedUsers.filter((id) => id !== user._id)
  //   });
  //   sendCoreMessage({
  //     subdomain: 'os',
  //     action: 'sendMobileNotification',
  //     data: {
  //       title: `${item.name}`,
  //       body: `${notificationDoc.createdUser?.details?.fullName ||
  //         notificationDoc.createdUser?.details
  //           ?.shortName} invited you to the ${contentType}`,
  //       receivers: invitedUsers.filter((id) => id !== user._id),
  //       data: {
  //         type: contentType,
  //         id: item._id
  //       }
  //     }
  //   });
  // }
  // sendNotification(subdomain, {
  //   ...notificationDoc
  // });
};

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    action: 'goal',
    serviceName,
    data: {
      type: contentType,
      _ids,
      action: 'count'
    },
    isRPC: true
  });
};

export const goalObject = async (
  subdomain: string,
  type: string,
  goalIds: string[],
  targetIds: string[]
) => {
  const [serviceName, contentType] = type.split(':');

  return sendCommonMessage({
    subdomain,
    serviceName,
    action: 'goal',
    data: {
      goalIds,
      targetIds,
      type: contentType,
      action: 'goalObject'
    },
    isRPC: true
  });
};

export const fixRelatedItems = async ({
  subdomain,
  type,
  sourceId,
  destId,
  action
}: {
  subdomain: string;
  type: string;
  sourceId: string;
  destId?: string;
  action: string;
}) => {
  const [serviceName, contentType] = type.split(':');

  sendCommonMessage({
    subdomain,
    serviceName,
    action: 'fixRelatedItems',
    data: {
      sourceId,
      destId,
      type: contentType,
      action
    }
  });
};
