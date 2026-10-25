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

  // The preference slot, `<plugin>:<module>:<event>` as the plugin's
  // notifications meta declares it. Not derived from contentType, which
  // points at the record.
  event: z
    .string()
    .regex(/^[^:]+:[^:]+:[^:]+$/)
    .optional(),
  // false: email and push only, no inbox item (a chat message)
  inApp: z.boolean().default(true),
  // FCM data the mobile app routes on; values must be strings
  pushData: z.record(z.string()).optional(),
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

  // Core delivers email and push for an event it can name. A caller not yet
  // on `event` keeps this in-process delivery, so a mixed deploy never sends
  // twice.
  const event = parsedData.kind === 'user' ? parsedData.event : undefined;

  if (notificationType && !event) {
    await sendNotificationChannels(subdomain, data);
  }
};

export const sendNotificationChannels = async (
  subdomain: string,
  notification: {
    userIds: string[];
    notificationType?: string;
    fromUserId?: string;
    contentTypeId?: string | Types.ObjectId;
  } & Partial<INotificationData>,
) => {
  const {
    notificationType: eventName,
    userIds,
    contentType,
    contentTypeId,
    fromUserId,
    title,
    message,
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

  const recipientIds: Record<string, string[]> = { email: [], mobile: [] };

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

    const eventSetting = events?.[`${pluginName}:${moduleName}:${eventName}`];

    if (!eventSetting?.enabled) {
      continue;
    }

    const mutedChannels: string[] = eventSetting.mutedChannels || [];
    const channels = (events?.[pluginName]?.channels || []).filter(
      (channel: string) => !mutedChannels.includes(channel),
    );

    if (!channels.length) {
      continue;
    }

    if (channels.includes('email')) {
      recipientIds['email'].push(userId);
    }

    if (channels.includes('mobile')) {
      recipientIds['mobile'].push(userId);
    }
  }

  if (recipientIds['mobile'].length) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'notifications',
      action: 'sendMobileNotification',
      input: {
        receivers: recipientIds['mobile'],
        title,
        body: message,
        // FCM data values must be strings
        data: {
          contentType,
          contentTypeId: String(contentTypeId ?? ''),
          notificationType: eventName ?? '',
        },
      },
      defaultValue: null,
    });
  }

  if (recipientIds['email']?.length) {
    await sendNotificationEmail(subdomain, {
      ...notification,
      userIds: recipientIds['email'],
    });
  }
};
