import { z } from 'zod';

export const whatsappConfigSchema = z.object({
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, 'Phone number ID is required'),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1, 'Access token is required'),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1, 'Verify token is required'),
});
