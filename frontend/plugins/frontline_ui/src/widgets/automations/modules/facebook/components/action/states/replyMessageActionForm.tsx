import { z } from 'zod';

const buttonSchema = z
  .array(
    z.object({
      _id: z.string(),
      text: z.string(),
      type: z.enum(['button', 'link']).default('button').optional(),
      link: z.string().optional(),
      isEditing: z.boolean().default(false).optional(),
    }),
  )
  .optional();

export const replyMessageFormSchema = z.object({
  messages: z.array(
    z.object({
      _id: z.string(),
      type: z.string(),
      buttons: buttonSchema,
      image: z.string().optional().optional(),
      cards: z
        .array(
          z.object({
            _id: z.string(),
            title: z.string(),
            subtitle: z.string(),
            label: z.string(),
            image: z.string().optional(),
            buttons: buttonSchema,
          }),
        )
        .optional(),
      quickReplies: z
        .array(
          z.object({
            _id: z.string(),
            text: z.string(),
            image_url: z.string().optional(),
            isEditing: z.boolean().default(false).optional(),
          }),
        )
        .optional(),
      text: z.string().optional(),
      audio: z.string().optional(),
      video: z.string().optional(),
      attachments: z.array(z.any()).optional(),
      input: z
        .object({
          text: z.string(),
          value: z.string(),
          type: z.enum(['minute', 'hour', 'day', 'month', 'year'], {
            required_error: 'Time unit is required',
          }),
        })
        .optional(),
    }),
  ),
});

export type TMessageActionForm = z.infer<typeof replyMessageFormSchema>;
export type TBotMessage = NonNullable<TMessageActionForm['messages']>[number];
export type TBotMessageCard = NonNullable<TBotMessage['cards']>[number];
export type TBotMessageButton = NonNullable<TBotMessage['buttons']>[number];
