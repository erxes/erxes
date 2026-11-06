import {
  automationOptionalConnectsSchema,
  describeConfigField as described,
} from 'erxes-api-shared/core-modules';
import { z } from 'zod/v4';

/**
 * Config contracts of frontline's automation actions: what each handler reads
 * or refuses, published to authors as configJsonSchema.
 */

// The builder writes these as text: comma-separated ids or a {{ }} variable.
const idsText = described(
  z.string(),
  'Comma-separated ids or a {{ }} variable, as text.',
).optional();

const requiredText = (description: string) =>
  described(z.string().trim().min(1), description);

const button = z.object({
  _id: described(
    z.string(),
    'Button id; a button without link is a branch, linked through optionalConnects.',
  ),
  text: z.string(),
  type: z.enum(['button', 'link']).optional(),
  link: z.string().optional(),
});

const botMessage = z.object({
  _id: z.string(),
  type: described(
    z.enum([
      'text',
      'card',
      'quickReplies',
      'input',
      'image',
      'video',
      'audio',
      'attachments',
      'ticketForm',
    ]),
    'text sends text with optional buttons; card a carousel of cards; quickReplies text with reply chips; input waits for the customer to answer.',
  ),
  text: described(
    z.string(),
    'Message text; {{ }} placeholders allowed.',
  ).optional(),
  buttons: z.array(button).optional(),
  cards: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        label: z.string().optional(),
        image: z.string().optional(),
        buttons: z.array(button).optional(),
      }),
    )
    .optional(),
  quickReplies: z
    .array(z.object({ _id: z.string(), text: z.string() }))
    .optional(),
  input: z
    .object({
      text: z.string(),
      value: z.string(),
      type: z.enum(['minute', 'hour', 'day', 'month', 'year']),
    })
    .optional(),
  image: z.string().optional(),
  video: z.string().optional(),
  audio: z.string().optional(),
  attachments: z
    .array(
      z.object({
        _id: z.string(),
        url: z.string(),
        type: z.string().optional(),
      }),
    )
    .optional(),
});

const botMessages = described(z.array(botMessage), 'Messages sent in order.');

const branchLinks = described(
  automationOptionalConnectsSchema,
  'Branch links: optionalConnectId is a button or quick reply _id; actionId is the next action.',
).optional();

export const messengerMessageActionConfigSchema = z.object({
  messages: botMessages.optional(),
  text: described(
    z.string(),
    'Single text reply, used when messages is empty; an AI reply earlier in the run is sent when both are empty.',
  ).optional(),
  optionalConnects: branchLinks,
});

export const socialMessageActionConfigSchema = z.object({
  botId: described(
    z.string(),
    "_id of the page bot that sends the messages; the trigger's bot when absent.",
  ).optional(),
  messages: botMessages.min(1),
  optionalConnects: branchLinks,
});

export const socialCommentActionConfigSchema = z
  .object({
    texts: described(
      z.array(z.string()),
      'Reply variants; one is picked per comment, since pages posting the same text are restricted.',
    ).optional(),
    text: z.string().optional(),
    attachments: z
      .array(z.object({ url: z.string().min(1), type: z.string().optional() }))
      .max(1)
      .optional(),
    mentionSender: z.boolean().optional(),
  })
  .refine(
    ({ texts, text }) =>
      !!text?.trim() || (texts || []).some((variant) => variant.trim()),
    { path: ['texts'], message: 'Add at least one reply' },
  );

export const discordMessageActionConfigSchema = z
  .object({
    target: described(
      z.enum(['conversation', 'channel', 'dm']),
      'conversation replies in the triggering conversation; channel and dm need botId.',
    ).optional(),
    botId: z.string().optional(),
    channelId: z.string().optional(),
    userId: z.string().optional(),
    content: described(
      z.string(),
      'Message text; {{ }} placeholders allowed.',
    ).optional(),
    embed: z
      .object({
        title: z.string(),
        description: z.string(),
        url: z.string(),
        color: z.string(),
        imageUrl: z.string(),
      })
      .partial()
      .optional(),
    buttons: z
      .array(z.object({ label: z.string(), url: z.string() }).partial())
      .optional(),
    attachments: z
      .array(z.object({ url: z.string(), filename: z.string() }).partial())
      .optional(),
  })
  .refine(
    ({ content, embed, buttons, attachments }) =>
      !!content?.trim() ||
      Object.values(embed || {}).some((value) => !!value?.trim()) ||
      (buttons || []).some(({ label, url }) => label?.trim() && url?.trim()) ||
      (attachments || []).some(({ url }) => url?.trim()),
    {
      path: ['content'],
      message: 'Add content, an embed, a button, or an attachment',
    },
  )
  .refine(
    ({ target, botId }) =>
      (target ?? 'conversation') === 'conversation' || !!botId?.trim(),
    { path: ['botId'], message: 'Required for channel and dm targets' },
  )
  .refine(
    ({ target, channelId }) => target !== 'channel' || !!channelId?.trim(),
    {
      path: ['channelId'],
      message: 'Required for the channel target',
    },
  )
  .refine(({ target, userId }) => target !== 'dm' || !!userId?.trim(), {
    path: ['userId'],
    message: 'Required for the dm target',
  });

export const mailReplyActionConfigSchema = z.object({
  subject: z.string().optional(),
  content: requiredText('Reply body; {{ }} placeholders allowed.'),
  shouldResolve: described(
    z.boolean(),
    'Close the conversation once the reply is sent.',
  ).optional(),
});

export const ticketCreateActionConfigSchema = z
  .object({
    name: described(
      z.string(),
      'Ticket name; {{ }} placeholders allowed.',
    ).optional(),
    cardName: z.string().optional(),
    channelId: requiredText('_id of the ticket channel.'),
    pipelineId: requiredText('_id of a pipeline of that channel.'),
    statusId: requiredText('_id of a status of that pipeline.'),
    description: z.string().optional(),
    priority: described(
      z.string(),
      'A choice as the builder writes it: "[[ n ]]", n from 0 (no priority) to 4 (critical).',
    ).optional(),
    assigneeId: z.string().optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    labelIds: idsText,
    tagIds: idsText,
    companyId: z.string().optional(),
    attachmentIds: idsText,
  })
  .refine(({ name, cardName }) => !!(name || cardName)?.trim(), {
    path: ['name'],
    message: 'Required',
  });
