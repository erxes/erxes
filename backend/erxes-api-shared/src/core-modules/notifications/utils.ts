import { Types } from 'mongoose';
import { z } from 'zod';
import { sendTRPCMessage } from '../../utils';
const baseNotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  metadata: z.record(z.any()).optional(),

  contentType: z.string(),
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
  data: { userIds: string[] } & Partial<INotificationData>,
) => {
  const { userIds, kind, ...notificationData } = data;

  const parsedData = notificationZTypeSchema.parse({
    ...notificationData,
    kind: kind ?? 'user',
  });

  sendTRPCMessage({
    pluginName: 'core',
    method: 'mutation',
    module: 'notifications',
    action: 'create',
    input: { data: parsedData, userIds },
  });
};
