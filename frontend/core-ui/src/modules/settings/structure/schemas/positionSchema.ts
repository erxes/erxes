import { z } from 'zod';

export const POSITION_SCHEMA = z.object({
  title: z.string(),
  code: z.string(),
  parentId: z.string().optional(),
  status: z.string().optional(),
  userIds: z.string().array().optional(),
});
