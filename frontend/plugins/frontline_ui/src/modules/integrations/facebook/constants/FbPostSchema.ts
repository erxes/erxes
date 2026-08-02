import { z } from 'zod';

export const FACEBOOK_POST_SCHEMA = z.object({
  pageId: z.string().min(1, 'Page is required'),
  message: z.string().trim().min(1, 'Message is required'),
  // Optional — Facebook attaches a link preview when this is set.
  link: z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]),
});
