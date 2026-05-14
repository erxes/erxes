import { z } from 'zod';

export const reCalcRemainderSchema = z.object({
  branchId: z.string(),
  departmentId: z.string(),
  productCategoryId: z.string().optional(),
});
