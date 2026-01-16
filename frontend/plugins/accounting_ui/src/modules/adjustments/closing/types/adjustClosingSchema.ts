import { z } from 'zod';

export const adjustClosingSchema = z.object({
  status: z.string().nullish(),
  date: z.date(),
  description: z.string(),
  beginDate: z.date().nullish(),

  integrateAccountId: z.string().nullish(),
  periodGLAccountId: z.string().nullish(),
  earningAccountId: z.string().nullish(),
  taxPayableAccountId: z.string().nullish(),
});
