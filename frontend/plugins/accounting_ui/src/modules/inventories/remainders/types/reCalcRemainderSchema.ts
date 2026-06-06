import { z } from 'zod';

export const reCalcRemainderSchema = z.object({
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  productCategoryId: z.string().optional(),
});
