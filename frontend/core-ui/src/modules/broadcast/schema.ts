import { z } from 'zod';
import { BROADCAST_EVERY_VALUES } from './utils/scheduleForm';

const baseSchema = {
  title: z.string().min(1),
  targetType: z.enum(['segment', 'tag', 'customer']),
  targetIds: z.array(z.string()).min(1),

  targetCount: z.number().default(0),
  isLive: z.boolean(),
  isDraft: z.boolean(),
  // Held on the form only so the header can carry it; it is applied after the
  // campaign is saved, never as part of saving it.
  schedule: z
    .object({
      every: z.enum(BROADCAST_EVERY_VALUES),
      at: z.date().optional(),
      endDate: z.date().optional(),
    })
    .optional(),
};

export const broadcastSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('email'),
    fromEmail: z.string().min(1),
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
      content: z.string().optional(),
      contentJson: z.any().optional(),
      contentFormat: z.enum(['blocks', 'maily']).optional(),
      previewText: z.string().optional(),
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
    cpId: z.string().min(1),
    notification: z.object({
      inApp: z.boolean().default(true),
      isMobile: z.boolean(),
      title: z.string().min(1),
      content: z.string().min(1),
    }),
    ...baseSchema,
  }),

  // A workflow campaign has no content of its own: the flow lives in the
  // automation the campaign owns, so only the recipients are filled in here.
  z.object({
    method: z.literal('workflow'),
    workflow: z
      .object({
        actions: z.array(z.any()).default([]),
        entryActionId: z.string().optional(),
      })
      .optional(),
    ...baseSchema,
  }),
]);
