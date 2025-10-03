import { z } from 'zod';

export const DEPARTMENT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  supervisorId: z.string().optional(),
  code: z.string(),
  parentId: z.string().optional(),
  userIds: z.string().array().optional(),
});
