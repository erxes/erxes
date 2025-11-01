import { z } from 'zod';

export const BRANDS_FORM_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  emailConfig: z.any().optional(),
});
