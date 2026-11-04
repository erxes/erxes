import { sendNotification as sendCoreNotification } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { TSalesNotificationEvent } from '~/meta/notifications';
import { IDealDocument } from '@/sales/@types';
import { notifiedUserIds } from '~/modules/sales/utils';

const sendNotification = async ({
  subdomain,
  userIds = [],
  data,
  allowMultiple,
}: {
  subdomain: string;
  userIds?: string[];
  data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    fromUserId: string;
    contentType: string;
    contentTypeId: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    action: string;
    event: TSalesNotificationEvent;
  };
  allowMultiple?: boolean;
}) => {
  const { event, ...notification } = data;
  const [, , eventName] = event.split(':');

  await sendCoreNotification(subdomain, {
    ...notification,
    type: notification.type ?? 'info',
    kind: 'user',
    userIds,
    notificationType: eventName,
    event,
    allowMultiple,
  });
};

export const sendNotifications = async (
  models: IModels,
  subdomain: string,
  {
    item,
    user,
    action,
    content,
    invitedUsers,
    removedUsers,
    event,
  }: {
    item: IDealDocument;
    user: IUserDocument;
    action: string;
    content: string;
    invitedUsers?: string[];
    removedUsers?: string[];
    // what the assigned and watching users are told about
    event: TSalesNotificationEvent;
  },
) => {
  const stage = await models.Stages.getStage(item.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  const title = `deal updated`;

  if (!content) {
    content = `deal '${item.name}'`;
  }

  const usersToExclude = [
    ...(removedUsers || []),
    ...(invitedUsers || []),
    user._id,
  ];

  const allNotified = await notifiedUserIds(models, item, stage, pipeline);
  // keep only assigned + watched, exclude pipeline watchers
  const pipelineWatchers = pipeline.watchedUserIds || [];
  const receivers = allNotified
    .filter(
      (id) =>
        !pipelineWatchers.includes(id) || item.assignedUserIds?.includes(id),
    ) // keep if assigned (already in list) but not pure pipeline watchers
    .filter((id) => usersToExclude.indexOf(id) < 0);

  const notificationDoc = {
    fromUserId: user._id,
    title,
    contentType: 'sales:deal',
    contentTypeId: item._id,
    action: action ? action : `has updated deal`,
    message: content,
    event,
  };

  // removed users
  if (removedUsers?.length) {
    sendNotification({
      subdomain,
      userIds: removedUsers.filter((id) => id !== user._id),
      data: {
        ...notificationDoc,
        action: `removed you from deal`,
        message: `'${item.name}'`,
        event: 'sales:deals:dealAssignee',
      },
      allowMultiple: false,
    });
  }

  // invited users
  if (invitedUsers?.length) {
    sendNotification({
      subdomain,
      userIds: invitedUsers.filter((id) => id !== user._id),
      data: {
        ...notificationDoc,
        action: `invited you to the deal`,
        message: `'${item.name}'`,
        event: 'sales:deals:dealAssignee',
      },
      allowMultiple: false,
    });
  }

  const excludedSet = new Set([...(removedUsers || []), user._id]);

  const invitedSet = new Set(invitedUsers || []);

  const filteredReceivers = receivers.filter(
    (id) => !invitedSet.has(id) && !excludedSet.has(id),
  );

  if (filteredReceivers.length > 0) {
    sendNotification({
      subdomain,
      userIds: filteredReceivers,
      data: notificationDoc,
    });
  }
};
