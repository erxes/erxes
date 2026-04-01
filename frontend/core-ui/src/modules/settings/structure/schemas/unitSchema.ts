import { z } from 'zod';

export const UNIT_SCHEMA = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  code: z.string(),
  supervisorId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  userIds: z.string().array().nullable().optional(),
});
