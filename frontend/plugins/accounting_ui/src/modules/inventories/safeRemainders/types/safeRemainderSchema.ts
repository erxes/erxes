import { z } from 'zod';

export const safeRemainderSchema = z.object({
  date: z.date(),
  description: z.string(),

  branchId: z.string(),
  departmentId: z.string(),
  productCategoryId: z.string().nullish(),
});
