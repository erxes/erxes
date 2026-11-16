import { z } from 'zod';

export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const sendNotificationConfigFormSchema = z.object({
  userIds: z.string().trim().min(1, 'Choose at least one team member'),
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
});

export type TSendNotificationConfigForm = z.infer<
  typeof sendNotificationConfigFormSchema
>;
