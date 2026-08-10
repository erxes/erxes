import { z } from 'zod';

export const WEBSITE_APP_SCHEMA = z.object({
  _id: z.string().optional(),
  kind: z.string().default('webstite'),
  showInInbox: z.boolean().default(false),
  credentials: z.object({
    integrationId: z.string().default(''),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    url: z.string().default(''),
  }),
  scopeBrandIds: z.array(z.string()).default([]),
});

export const EM_SETTINGS_SCHEMA = z.object({
  languageCode: z.string().default('en'),
  requireAuth: z.boolean().default(false),
  showChat: z.boolean().default(true),
  showLauncher: z.boolean().default(true),
  forceLogoutWhenResolve: z.boolean().default(false),
  notifyCustomer: z.boolean().default(false),
  showVideoCallRequest: z.boolean().default(false),
  websiteApps: z.array(WEBSITE_APP_SCHEMA).default([]),
});
