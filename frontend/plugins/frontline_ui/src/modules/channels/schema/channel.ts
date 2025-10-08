import { z } from 'zod';

export const CHANNEL_SCHEMA = z.object({
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  memberIds: z.string().array().optional(),
});
