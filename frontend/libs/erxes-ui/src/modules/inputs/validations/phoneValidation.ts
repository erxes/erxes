import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(8, 'Phone number must be at least 8 characters')
    .max(16, 'Phone number must not exceed 16 characters')
    .regex(
      /^\+?[\d]+$/,
      'Phone number can only contain digits and + prefix',
    ),
});
