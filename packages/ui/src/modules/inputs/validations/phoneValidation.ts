import { z } from 'zod';

/** A phone number as typed: 8 to 16 digits after an optional +. `PhoneInput` words each issue by its code. */
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(8)
    .max(16)
    .regex(/^\+?[\d]+$/),
});
