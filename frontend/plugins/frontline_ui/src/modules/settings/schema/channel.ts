import { z } from 'zod';

export const CHANNEL_FORM_SCHEMA = z.object({
  name: z.string(),
  description: z.string().optional(),
  memberIds: z.string().array().optional(),
});
