import { z } from 'zod';

export const CHANNEL_MEMBER_FORM_SCHEMA = z.object({
  memberIds: z.string().array().optional(),
});
