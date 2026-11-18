import { z } from 'zod';

export const CHANNEL_SCHEMA = z.object({
  name: z.string().trim().min(1, 'Channel name is required'),
  icon: z.string().optional().nullable(),
  description: z.string().optional(),
  memberIds: z.string().array().optional(),
  scope: z.string().default('team').optional(),
});
