import { z } from 'zod';

export const adjustFundRateSchema = z.object({
  mainCurrency: z.string().min(1, 'Main Currency is required'),
  currency: z.string().min(1, 'Currency is required'),
  spotRate: z.number().min(0, 'Spot Rate must be greater than 0'),
  date: z.date({
    required_error: 'Date is required',
  }),
  description: z.string().optional(),
  gainAccountId: z.string().min(1, 'Gain Account is required'),
  lossAccountId: z.string().min(1, 'Loss Account is required'),
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
});

export type TAdjustFundRateForm = z.infer<typeof adjustFundRateSchema>;
