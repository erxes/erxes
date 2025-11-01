import { z } from 'zod';

export const TICKET_STATUS_FORM_SCHEMA = z.object({
  name: z.string().min(1).max(16),
  description: z.string().max(255).optional(),
  color: z.string().optional(),
});

