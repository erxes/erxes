import { z } from 'zod';

export const adjustClosingSchema = z.object({
  status: z.string().optional(),
  date: z.date(),
  description: z.string(),
  beginDate: z.date().optional(),

  integrateAccountId: z.string().optional(),
  periodGLAccountId: z.string().optional(),
  earningAccountId: z.string().optional(),
  taxPayableAccountId: z.string().optional(),

  accountId: z.string().optional(),
  balance: z.number().optional(),
  percent: z.number().optional(),
  mainAccTrId: z.string().optional(),
  integrateTrId: z.string().optional(),
});
