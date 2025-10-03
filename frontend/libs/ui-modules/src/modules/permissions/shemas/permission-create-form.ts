import { z } from 'zod';

export const PERMISSION_FORM_SCHEMA = z.object({
  module: z.string().min(1, 'Module is required'),
  actions: z
    .array(z.string().min(1, 'Action is required'))
    .min(1, 'At least one action is required'),
  userIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  allowed: z.boolean().default(true),
});
