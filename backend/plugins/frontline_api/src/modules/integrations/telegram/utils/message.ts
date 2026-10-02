import { z } from 'zod';

const telegramUserSchema = z
  .object({
    id: z.number().int().positive().safe(),
    is_bot: z.boolean(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();

const telegramChatSchema = z
  .object({
    id: z.number().int().safe(),
    type: z.enum(['private', 'group', 'supergroup', 'channel']),
    title: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();

export const telegramMessageSchema = z
  .object({
    message_id: z.number().int().nonnegative().safe(),
    date: z.number().int().positive().safe(),
    chat: telegramChatSchema,
    from: telegramUserSchema.optional(),
    sender_chat: telegramChatSchema.optional(),
    text: z.string().optional(),
    message_thread_id: z.number().int().nonnegative().safe().optional(),
    is_topic_message: z.boolean().optional(),
  })
  .passthrough();

export type TelegramMessage = z.infer<typeof telegramMessageSchema>;
