import { z } from 'zod';

const buttonSchema = z.array(
  z.object({
    _id: z.string(),
    text: z.string(),
    type: z.enum(['button', 'link']).default('button').optional(),
    link: z.string().optional(),
    isEditing: z.boolean().default(false).optional(),
  }),
);
const textMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('text'),
  text: z.string().min(1, 'Text is required'),
  buttons: buttonSchema,
});

const cardMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('card'),
  cards: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      subtitle: z.string(),
      label: z.string(),
      image: z.string().optional(),
      buttons: buttonSchema,
    }),
  ),
});

const quickRepliesSchema = z.object({
  type: z.literal('quickReplies'),
  _id: z.string(),
  text: z.string().min(1, 'Text is required'),
  quickReplies: z.array(
    z.object({
      _id: z.string(),
      text: z.string(),
      image_url: z.string().optional(),
      isEditing: z.boolean().default(false).optional(),
    }),
  ),
});

const inputMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('input'),
  input: z.object({
    text: z.string(),
    value: z.string(),
    type: z.enum(['minute', 'hour', 'day', 'month', 'year'], {
      required_error: 'Time unit is required',
    }),
  }),
});

const imageMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('image'),
  image: z.string(),
});

const attachmentsMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('attachments'),
  attachments: z.array(z.any()).optional(),
});

const videoMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('video'),
  video: z.string(),
});
const audioMessageSchema = z.object({
  _id: z.string(),
  type: z.literal('audio'),
  audio: z.string(),
});

const replyMessageSchema = z.discriminatedUnion('type', [
  textMessageSchema,
  imageMessageSchema,
  cardMessageSchema,
  audioMessageSchema,
  videoMessageSchema,
  attachmentsMessageSchema,
  inputMessageSchema,
  quickRepliesSchema,
]);
export const replyMessageFormSchema = z.object({
  messages: z.array(replyMessageSchema),
});

export type TMessageActionForm = z.infer<typeof replyMessageFormSchema>;
export type TBotMessage = NonNullable<TMessageActionForm['messages']>[number];

export type TBotMessageCard = NonNullable<
  Extract<TBotMessage, { type: 'card' }>['cards']
>[number];
export type TBotMessageButton = z.infer<typeof buttonSchema>[number];
