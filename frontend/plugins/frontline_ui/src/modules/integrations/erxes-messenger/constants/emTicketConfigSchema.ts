import { z } from 'zod';

export const EM_TICKET_CONFIG_SCHEMA = z.object({
  configId: z.string().optional(),
});
