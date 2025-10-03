import { z } from 'zod';

export const BRANDS_FORM_SCHEMA = z.object({
  name: z.string(),
  description: z.string().optional(),
  emailConfig: z.any().optional(),
});
