import { z } from 'zod';

export const POSITION_SCHEMA = z.object({
  title: z.string(),
  code: z.string().min(1, { message: 'Code is required' }),
  parentId: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  userIds: z.string().array().nullable().optional(),
});
