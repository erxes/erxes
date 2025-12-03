import { z } from 'zod';

export type TReportForm = z.infer<typeof reportSchema>;

export const reportSchema = z.object({
  groupKey: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  isTemp: z.boolean().optional(),
  isOutBalance: z.boolean().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});
