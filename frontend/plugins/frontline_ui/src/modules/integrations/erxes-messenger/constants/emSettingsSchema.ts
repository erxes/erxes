import { z } from 'zod';

export const EM_SETTINGS_SCHEMA = z.object({
  languageCode: z.string().default('en'),
  requireAuth: z.boolean().default(false),
  showChat: z.boolean().default(true),
  showLauncher: z.boolean().default(true),
  forceLogoutWhenResolve: z.boolean().default(false),
  notifyCustomer: z.boolean().default(false),
  showVideoCallRequest: z.boolean().default(false),
});
