import { z } from 'zod';

export const adjustClosingSchema = z.object({
  status: z.string().optional(),
  date: z.date(),
  description: z.string(),
  beginDate: z.date().optional(),

  integrateAccountId: z.string().min(1),
  periodGLAccountId: z.string().min(1),
  earningAccountId: z.string().min(1),
  taxPayableAccountId: z.string().min(1),

  accountId: z.string().optional(),
  balance: z.number().optional(),
  percent: z.number().optional(),
  mainAccTrId: z.string().optional(),
  integrateTrId: z.string().optional(),
});
