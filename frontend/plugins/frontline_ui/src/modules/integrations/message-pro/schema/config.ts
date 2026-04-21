import { z } from 'zod';

export const MESSAGE_PRO_CONFIG_SCHEMA = z.object({
  MESSAGE_PRO_API_KEY: z.string().optional(),
  MESSAGE_PRO_PHONE_NUMBER: z.string().optional(),
});
