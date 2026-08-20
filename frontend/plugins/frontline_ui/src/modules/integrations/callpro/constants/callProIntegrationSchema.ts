import { z } from 'zod';

export const CALL_PRO_INTEGRATION_FORM_SCHEMA = z.object({
  name: z.string().min(1),
  phoneNumber: z
    .string()
    .regex(/^[\d\s\-()+]+$/, {
      message:
        'Phone number can include digits, spaces, dashes, parentheses, and plus signs.',
    })
    .min(1),
  recordUrl: z.union([z.string().url(), z.literal('')]).optional(),
  brandId: z.string().min(1, 'Brand is required'),
});
