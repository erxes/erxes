import { z } from 'zod';

export const POS_ORDER_FORM_SCHEMA = z.object({
  cashAmount: z.number().min(0, 'Cash amount must be positive'),
  mobileAmount: z.number().min(0, 'Mobile amount must be positive'),
  spendPoints: z.number().min(0, 'Spend points must be positive'),
});
