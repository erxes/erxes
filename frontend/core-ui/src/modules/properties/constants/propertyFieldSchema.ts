import { z } from 'zod';

export const propertyFieldSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.string().min(1),
  options: z.array(z.string()).optional(),
});
