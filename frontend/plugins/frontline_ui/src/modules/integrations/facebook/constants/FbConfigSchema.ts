import { z } from 'zod';

export const facebookConfigSchema = z.object({
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_VERIFY_TOKEN: z.string().optional(),
  FACEBOOK_PERMISSIONS: z.string().optional(),
});
