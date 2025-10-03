import { z } from 'zod';

export const adjustInventorySchema = z.object({
  date: z.date(),
  description: z.string(),
  beginDate: z.date().nullish(),
  successDate: z.date().nullish(),
  checkedAt: z.date().nullish(),
});
