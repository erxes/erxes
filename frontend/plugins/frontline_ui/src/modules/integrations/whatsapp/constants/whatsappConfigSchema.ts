import { z } from 'zod';

export const whatsappConfigSchema = z.object({
  WHATSAPP_VERIFY_TOKEN: z.string().min(1, 'Verify token is required'),
});
