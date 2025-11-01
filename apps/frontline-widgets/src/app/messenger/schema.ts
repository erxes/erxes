import { z } from 'zod';

export const ticketSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
