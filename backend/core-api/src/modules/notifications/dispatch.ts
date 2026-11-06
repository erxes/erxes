import {
  INotificationDocument,
  TNotificationChannel,
} from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';
import {
  findNotificationEventDefaults,
  resolveEventChannels,
} from '~/modules/notifications/channels';
import { sendMobilePush } from '~/modules/notifications/push';

export type TNotificationDispatchData = {
  event: string;
  title?: string;
  message?: string;
  content?: string;
  fromUserId?: string;
  contentType?: string;
  contentTypeId?: string;
  notificationType?: string;
  pushData?: Record<string, string>;
};

const getUserName = async (models: IModels, userId?: string) => {
  if (!userId) {
    return;
  }

  const user = await models.Users.findOne({ _id: userId }).lean();

  if (user?.details) {
    return `${user.details.firstName || ''} ${user.details.lastName || ''}`;
  }

  return user?.email;
};

const sendNotificationEmails = async (
  models: IModels,
  subdomain: string,
  {
    userIds,
    data,
    notifications,
  }: {
    userIds: string[];
    data: TNotificationDispatchData;
    notifications: INotificationDocument[];
  },
) => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  const users = await models.Users.find({
    _id: { $in: userIds },
    isActive: true,
    email: { $nin: [null, ''] },
  }).lean();

  if (!users.length) {
    return;
  }

  const userIdByEmail = new Map(users.map((user) => [user.email, user._id]));
  const notificationIdByUserId = new Map(
    notifications.map((notification) => [
      notification.userId,
      notification._id,
    ]),
  );

  await sendEmail(
    subdomain,
    {
      toEmails: users.map((user) => user.email as string),
      title: 'Notification',
      template: {
        name: 'notification',
        data: {
          notification: { title: data.title, content: data.content },
          action: data.message,
          userName: await getUserName(models, data.fromUserId),
          date: new Date().toLocaleString(),
        },
      },
      userId: data.fromUserId,
      // each recipient's link opens the notification written for them
      modifier: async (templateData, email) => {
        const userId = userIdByEmail.get(email);

        if (!userId) {
          return;
        }

        const notificationId = notificationIdByUserId.get(userId);

        templateData.uid = userId;
        templateData.notification.link = notificationId
          ? `${DOMAIN}/my-inbox/${notificationId}`
          : `${DOMAIN}/my-inbox`;
      },
    },
    models,
  );
};

/**
 * Email and push for a notification event, on the channels each recipient's
 * settings resolve to. The actor is never notified of their own action.
 */
export const dispatchNotificationChannels = async (
  models: IModels,
  subdomain: string,
  {
    userIds,
    data,
    notifications,
  }: {
    userIds: string[];
    data: TNotificationDispatchData;
    notifications: INotificationDocument[];
  },
) => {
  const defaults = await findNotificationEventDefaults(data.event);

  if (!defaults) {
    console.error(`Notification event is not declared: ${data.event}`);
    return;
  }

  const settings = await models.NotificationSettings.find({
    userId: { $in: userIds },
  }).lean();

  const eventsByUserId = new Map(
    settings.map((setting) => [setting.userId, setting.events || {}]),
  );

  const recipients: Record<TNotificationChannel, string[]> = {
    email: [],
    mobile: [],
  };

  for (const userId of userIds) {
    if (userId === data.fromUserId) {
      continue;
    }

    const channels = resolveEventChannels(
      eventsByUserId.get(userId) || {},
      data.event,
      defaults,
    );

    for (const channel of channels) {
      recipients[channel].push(userId);
    }
  }

  // one channel failing must not cost the other its delivery
  if (recipients.mobile.length) {
    await sendMobilePush(models, {
      receivers: recipients.mobile,
      title: data.title,
      body: data.message,
      data: data.pushData ?? {
        contentType: data.contentType ?? '',
        contentTypeId: String(data.contentTypeId ?? ''),
        notificationType: data.notificationType ?? '',
      },
    }).catch((e: Error) =>
      console.error(`Notification push failed: ${data.event}: ${e.message}`),
    );
  }

  if (recipients.email.length) {
    await sendNotificationEmails(models, subdomain, {
      userIds: recipients.email,
      data,
      notifications,
    }).catch((e: Error) =>
      console.error(`Notification email failed: ${data.event}: ${e.message}`),
    );
  }
};
