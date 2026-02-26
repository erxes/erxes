import { Types } from 'mongoose';
import { z } from 'zod';
import { sendTRPCMessage } from '../../utils';
import { sendNotificationEmail } from './emailUtils';

const baseNotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  metadata: z.record(z.any()).optional(),

  contentType: z.string(),
  content: z.string().optional(),
});

const systemNotificationSchema = baseNotificationSchema.extend({
  kind: z.literal('system'),
});

// User notification
const userNotificationSchema = baseNotificationSchema.extend({
  kind: z.literal('user').default('user'),
  fromUserId: z.string(),
  action: z.string(),
  notificationType: z.string(),
  allowMultiple: z.boolean().default(false),

  contentTypeId: z.union([z.string(), z.instanceof(Types.ObjectId)]),
});

// Union for notification
export const notificationZTypeSchema = z.discriminatedUnion('kind', [
  systemNotificationSchema,
  userNotificationSchema,
]);

export type INotificationData = z.infer<typeof notificationZTypeSchema>;

export const sendNotification = async (
  subdomain: string,
  data: {
    userIds: string[];
    notificationType?: string;
  } & Partial<INotificationData>,
) => {
  const { userIds, kind, notificationType, ...notificationData } = data;

  const parsedData = notificationZTypeSchema.parse({
    ...notificationData,
    notificationType,
    kind: kind ?? 'user',
  });

  await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'mutation',
    module: 'notifications',
    action: 'create',
    input: { data: parsedData, userIds },
    defaultValue: [],
  });

  if (notificationType) {
    await sendNotificationChannels(subdomain, data);
  }
};

export const sendNotificationChannels = async (
  subdomain: string,
  notification: {
    userIds: string[];
    notificationType?: string;
    fromUserId?: string;
  } & Partial<INotificationData>,
) => {
  const {
    notificationType: eventName,
    userIds,
    contentType,
    fromUserId,
  } = notification || {};

  if (!contentType) return;

  const [pluginName = '', moduleName = ''] = contentType.split(':');

  const userNotificationSettings = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'notifications',
    action: 'settings',
    input: { userIds },
    defaultValue: [],
  });

  const recipientIds: Record<string, string[]> = { email: [] };

  for (const userNotificationSetting of userNotificationSettings) {
    const { userId, events } = userNotificationSetting || {};

    if (fromUserId && userId === fromUserId) {
      continue;
    }

    if (!userIds.includes(userId)) {
      continue;
    }

    if (!events?.[pluginName]?.enabled) {
      continue;
    }

    if (!events?.[`${pluginName}:${moduleName}`]?.enabled) {
      continue;
    }

    if (!events?.[`${pluginName}:${moduleName}:${eventName}`]?.enabled) {
      continue;
    }

    const channels = events?.[pluginName]?.channels || [];

    if (!channels.length) {
      continue;
    }

    if (channels.includes('email')) {
      recipientIds['email'].push(userId);
    }
  }

  if (recipientIds['email']?.length) {
    await sendNotificationEmail(subdomain, {
      ...notification,
      userIds: recipientIds['email'],
    });
  }
};
