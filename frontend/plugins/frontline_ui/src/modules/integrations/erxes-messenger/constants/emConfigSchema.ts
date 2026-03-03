import { z } from 'zod';

export const EM_CONFIG_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  channelId: z.string(),
  ticketConfigId: z.string().optional().nullable(),
  botSetup: z
    .object({
      greetingMessage: z.string().optional(),
      persistentMenu: z
        .array(
          z.object({
            text: z.string().optional(),
            type: z.enum(['button', 'link']).optional(),
          }),
        )
        .optional(),
      botCheck: z.boolean().optional(),
    })
    .optional(),
  cloudflareCallsSetup: z
    .object({
      header: z.string().optional(),
      description: z.string().optional(),
      secondPageHeader: z.string().optional(),
      secondPageDescription: z.string().optional(),
      callRouting: z
        .array(
          z.object({
            name: z.string().optional(),
            operatorIds: z.array(z.string()).optional(),
          }),
        )
        .optional(),
      turnOn: z.boolean().optional(),
    })
    .optional(),
});
