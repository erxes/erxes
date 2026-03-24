import { z } from 'zod';

export const EMAPPEARANCE_SCHEMA = z.object({
  primary: z
    .object({
      DEFAULT: z.string(),
      foreground: z.string(),
    })
    .optional()
    .nullable(),
  logo: z.string().optional(),
});
