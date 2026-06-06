import { z } from 'zod';

export const TICKET_STATUS_FORM_SCHEMA = z.object({
  name: z.string().min(1),
  description: z
    .string()
    .max(255, 'Description must be at most 255 characters long')
    .optional(),
  color: z.string().optional(),
});
