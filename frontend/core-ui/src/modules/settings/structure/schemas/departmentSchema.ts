import { z } from 'zod';

export const DEPARTMENT_SCHEMA = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  supervisorId: z.string().nullable().optional(),
  code: z.string().min(1, { message: 'Code is required' }),
  parentId: z.string().nullable().optional(),
  userIds: z.string().array().nullable().optional(),
});
