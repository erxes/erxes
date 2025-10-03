import { z } from 'zod';

export const mainSettingsSchema = z.object({
  MainCurrency: z.string().min(1),
  HasVat: z.boolean(),
  VatPayableAccount: z.string().optional(),
  VatReceivableAccount: z.string().optional(),
  VatAfterPayableAccount: z.string().optional(),
  VatAfterReceivableAccount: z.string().optional(),
  HasCtax: z.boolean(),
  CtaxPayableAccount: z.string().optional(),
});

export type TMainSettings = z.infer<typeof mainSettingsSchema>;
