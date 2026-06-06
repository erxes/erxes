import { IUserDocument } from '../../core-types';
import { sendTRPCMessage } from '../../utils';
import { INotificationData } from './utils';

export const getUserDetail = async (subdomain: string, userId?: string) => {
  if (!userId) {
    return;
  }

  const user: IUserDocument = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'findOne',
    input: { query: { _id: userId } },
    defaultValue: {},
  });

  if (user.details) {
    return `${user.details?.firstName || ''} ${user.details?.lastName || ''}`;
  }

  return user.email;
};

export const sendNotificationEmail = async (
  subdomain: string,
  notification: {
    userIds: string[];
    notificationType?: string;
    fromUserId?: string;
  } & Partial<INotificationData>,
) => {
  const { userIds, message, fromUserId } = notification || {};

  const toEmails: string[] = [];

  const users: IUserDocument[] = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: userIds }, isActive: true } },
    defaultValue: [],
  });

  for (const user of users) {
    const { _id, email, isActive } = user || {};

    if (!userIds.includes(_id)) {
      continue;
    }

    if (!email || !isActive) {
      continue;
    }

    toEmails.push(email);
  }

  await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'mutation',
    module: 'notifications',
    action: 'sendEmail',
    input: {
      toEmails,
      title: 'Notification',
      template: {
        name: 'notification',
        data: {
          notification,
          action: message,
          userName: await getUserDetail(subdomain, fromUserId),
          date: new Date().toLocaleString(),
        },
      },
      userId: fromUserId,
    },
    defaultValue: [],
  });
};
