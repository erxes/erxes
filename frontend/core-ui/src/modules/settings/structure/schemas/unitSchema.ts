import { z } from 'zod';

export const UNIT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  code: z.string(),
  supervisorId: z.string().optional(),
  departmentId: z.string().optional(),
  userIds: z.string().array().optional(),
});
