import {z} from 'zod';

export const instagramConfigSchema = z.object({
    INSTAGRAM_APP_ID: z.string().optional(),
    INSTAGRAM_APP_SECRET: z.string().optional(),
    INSTAGRAM_VERIFY_TOKEN: z.string().optional(),
    INSTAGRAM_PERMISSIONS: z.string().optional(),
  });
  