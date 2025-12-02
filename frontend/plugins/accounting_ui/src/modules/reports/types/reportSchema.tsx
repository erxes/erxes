import { z } from 'zod';

export type TReportForm = z.infer<typeof reportSchema>;

export const reportSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  isTemp: z.boolean().optional(),
  isOutBalance: z.boolean().optional(),
  beginDate: z.date().optional(),
  endDate: z.date().optional(),
});
