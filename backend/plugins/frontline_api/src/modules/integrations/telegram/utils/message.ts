import { z } from 'zod';

export const telegramUserSchema = z
  .object({
    id: z.number().int().positive().safe(),
    is_bot: z.boolean(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();

export const telegramChatSchema = z
  .object({
    id: z.number().int().safe(),
    type: z.enum(['private', 'group', 'supergroup', 'channel']),
    title: z.string().optional(),
    username: z.string().optional(),
  })
  .passthrough();

const telegramPhotoSizeSchema = z
  .object({
    file_id: z.string().min(1),
    file_unique_id: z.string().min(1),
    width: z.number().int().positive().safe(),
    height: z.number().int().positive().safe(),
    file_size: z.number().int().nonnegative().safe().optional(),
  })
  .passthrough();

const telegramDocumentSchema = z
  .object({
    file_id: z.string().min(1),
    file_unique_id: z.string().min(1),
    file_name: z.string().optional(),
    mime_type: z.string().optional(),
    file_size: z.number().int().nonnegative().safe().optional(),
  })
  .passthrough();

export const telegramPollSchema = z.object({
  id: z.string().min(1),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      persistent_id: z.string().optional(),
      voter_count: z.number().int().nonnegative(),
      media: z.unknown().optional(),
    }),
  ),
  total_voter_count: z.number().int().nonnegative(),
  is_closed: z.boolean(),
  is_anonymous: z.boolean(),
  type: z.enum(['regular', 'quiz']),
  allows_multiple_answers: z.boolean(),
  close_date: z.number().int().optional(),
  description: z.string().optional(),
  explanation: z.string().optional(),
  media: z.unknown().optional(),
});

const telegramLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  live_period: z.number().optional(),
});

// A quote is a snapshot, not another recursively persisted conversation.
const telegramReplySnapshotSchema = z.object({
  message_id: z.number().int().nonnegative().safe(),
  chat: telegramChatSchema,
  from: telegramUserSchema.optional(),
  sender_chat: telegramChatSchema.optional(),
  author_signature: z.string().optional(),
  text: z.string().optional(),
  caption: z.string().optional(),
  forum_topic_created: z.object({ name: z.string() }).optional(),
});

export const telegramMessageSchema = z
  .object({
    message_id: z.number().int().nonnegative().safe(),
    date: z.number().int().positive().safe(),
    chat: telegramChatSchema,
    from: telegramUserSchema.optional(),
    sender_chat: telegramChatSchema.optional(),
    text: z.string().optional(),
    caption: z.string().optional(),
    photo: z.array(telegramPhotoSizeSchema).optional(),
    document: telegramDocumentSchema.optional(),
    animation: telegramDocumentSchema.optional(),
    audio: telegramDocumentSchema.optional(),
    video: telegramDocumentSchema.optional(),
    voice: telegramDocumentSchema.optional(),
    video_note: telegramDocumentSchema.optional(),
    sticker: telegramDocumentSchema
      .extend({
        is_animated: z.boolean(),
        is_video: z.boolean(),
        emoji: z.string().optional(),
      })
      .optional(),
    live_photo: telegramDocumentSchema
      .extend({
        photo: z.array(telegramPhotoSizeSchema).optional(),
      })
      .optional(),
    contact: z
      .object({
        phone_number: z.string(),
        first_name: z.string(),
        last_name: z.string().optional(),
      })
      .optional(),
    location: telegramLocationSchema.optional(),
    venue: z
      .object({
        title: z.string(),
        address: z.string(),
        location: telegramLocationSchema,
      })
      .optional(),
    dice: z.object({ emoji: z.string(), value: z.number().int() }).optional(),
    poll: telegramPollSchema.optional(),
    edit_date: z.number().int().positive().safe().optional(),
    media_group_id: z.string().optional(),
    reply_to_message: telegramReplySnapshotSchema.optional(),
    quote: z.object({ text: z.string() }).optional(),
    forum_topic_created: z.object({ name: z.string() }).optional(),
    forum_topic_edited: z.object({ name: z.string().optional() }).optional(),
    new_chat_title: z.string().optional(),
    message_thread_id: z.number().int().nonnegative().safe().optional(),
    is_topic_message: z.boolean().optional(),
    author_signature: z.string().optional(),
    migrate_to_chat_id: z.number().int().safe().optional(),
    migrate_from_chat_id: z.number().int().safe().optional(),
  })
  .passthrough();

export type TelegramMessage = z.infer<typeof telegramMessageSchema>;
