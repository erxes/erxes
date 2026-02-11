import { z } from 'zod';

const baseSchema = {
  title: z.string().min(1),
  targetType: z.enum(['segment', 'tag', 'brand']),
  targetIds: z.array(z.string()).min(1),

  targetCount: z.number().default(0),
  isLive: z.boolean(),
  isDraft: z.boolean(),
};

export const broadcastSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('email'),
    fromUserId: z.string().min(1),
    email: z.object({
      subject: z.string().min(1),
      sender: z.string().min(1),
      replyTo: z.string().optional(),
      attachments: z
        .array(
          z.object({
            name: z.string(),
            url: z.string(),
            type: z.string(),
            size: z.number(),
          }),
        )
        .optional(),
      documentId: z.string(),
      content: z.string(),
    }),
    ...baseSchema,
  }),

  z.object({
    method: z.literal('messenger'),
    fromUserId: z.string().min(1),
    messenger: z.object({
      brandId: z.string().min(1),
      sentAs: z.enum(['badge', 'snippet', 'fullMessage']),
      kind: z.enum(['chat', 'note', 'post']),
      content: z.string(),
      rules: z.array(
        z.object({
          kind: z.string(),
          text: z.string(),
          condition: z.string(),
          value: z.string(),
        }),
      ),
    }),
    ...baseSchema,
  }),

  z.object({
    method: z.literal('notification'),
    notification: z.object({
      inApp: z.boolean().default(true),
      isMobile: z.boolean(),
      title: z.string().min(1),
      message: z.string(),
    }),
    ...baseSchema,
  }),
]);
