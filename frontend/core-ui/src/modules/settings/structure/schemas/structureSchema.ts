import { z } from 'zod';

export const STRUCTURE_DETAILS_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  code: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  supervisorId: z.string(),
});
