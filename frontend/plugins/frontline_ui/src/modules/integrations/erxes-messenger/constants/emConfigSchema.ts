import { z } from 'zod';

export const EM_CONFIG_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  channelId: z.string(),
  brandId: z.string().optional().nullable(),
  ticketConfigId: z.string().optional().nullable(),
  knowledgeBaseTopicId: z.string().optional().nullable(),
  botSetup: z
    .object({
      greetingMessage: z.string().optional(),
      persistentMenu: z
        .array(
          z.object({
            text: z.string().optional(),
            type: z.enum(['button', 'link']).optional(),
            link: z.string().optional(),
            contentType: z.string().optional().default('text'),
          }),
        )
        .optional(),
      botCheck: z.boolean().optional(),
      botShowInitialMessage: z.boolean().optional(),
      automationId: z.string().optional().nullable(),
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
