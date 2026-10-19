import { z } from 'zod';

// Message `extraData` is stored JSON, and the Facebook and Instagram message
// types still expose `providerData`, `replyTo` and `reactions` as JSON. Every leaf, list item and nested object falls back
// on its own, and objects keep keys they do not declare: forwarding sends
// snapshots back to the server, so nothing may be dropped on the way through.

const optionalString = z.string().optional().catch(undefined);
const optionalNumber = z.number().optional().catch(undefined);
const optionalBoolean = z.boolean().optional().catch(undefined);

const lenientList = <Out, In>(item: z.ZodType<Out, z.ZodTypeDef, In>) =>
  z
    .array(z.unknown())
    .optional()
    .catch(undefined)
    .transform((list) =>
      list?.flatMap((value): Out[] => {
        const parsed = item.safeParse(value);

        return parsed.success ? [parsed.data] : [];
      }),
    );

const optionalObject = <Shape extends z.ZodRawShape>(shape: Shape) =>
  z.object(shape).passthrough().optional().catch(undefined);

const ANSWER_ID_SCHEMA = z.union([z.string(), z.number()]);

const MESSAGE_ANSWER_SCHEMA = z
  .object({ id: ANSWER_ID_SCHEMA, text: z.string(), emoji: optionalString })
  .passthrough();

const MESSAGE_TALLY_SCHEMA = optionalObject({
  totalVoters: optionalNumber,
  isFinalized: optionalBoolean,
  answerCounts: lenientList(
    z.object({ id: ANSWER_ID_SCHEMA, count: z.number() }).passthrough(),
  ).transform((list) => list ?? []),
});

export const MESSAGE_POLL_SCHEMA = z
  .object({
    question: z.string(),
    answers: lenientList(MESSAGE_ANSWER_SCHEMA).transform((list) => list ?? []),
    allowMultiselect: optionalBoolean,
    expiry: optionalString,
    results: MESSAGE_TALLY_SCHEMA,
  })
  .passthrough();

const MESSAGE_SURVEY_ATTACHMENT_SCHEMA = z
  .object({
    url: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })
  .passthrough();

export const MESSAGE_SURVEY_STEP_SCHEMA = z
  .object({
    stepId: z.string(),
    name: optionalString,
    description: optionalString,
    question: z.string(),
    attachments: lenientList(MESSAGE_SURVEY_ATTACHMENT_SCHEMA),
    answers: lenientList(MESSAGE_ANSWER_SCHEMA).transform((list) => list ?? []),
    allowMultiselect: optionalBoolean,
  })
  .passthrough();

export const MESSAGE_SURVEY_SCHEMA = z
  .object({
    surveyId: optionalString,
    question: z.string(),
    answers: lenientList(MESSAGE_ANSWER_SCHEMA).transform((list) => list ?? []),
    allowMultiselect: optionalBoolean,
    steps: lenientList(MESSAGE_SURVEY_STEP_SCHEMA),
    expiry: optionalString,
    results: MESSAGE_TALLY_SCHEMA,
  })
  .passthrough();

const EMBED_MEDIA_SHAPE = {
  url: optionalString,
  width: optionalNumber,
  height: optionalNumber,
};

export const MESSAGE_EMBED_SCHEMA = z
  .object({
    type: optionalString,
    title: optionalString,
    description: optionalString,
    url: optionalString,
    color: optionalString,
    author: optionalObject({
      name: optionalString,
      url: optionalString,
      iconUrl: optionalString,
    }),
    provider: optionalObject({ name: optionalString, url: optionalString }),
    thumbnail: optionalObject(EMBED_MEDIA_SHAPE),
    image: optionalObject(EMBED_MEDIA_SHAPE),
    video: optionalObject(EMBED_MEDIA_SHAPE),
    fields: lenientList(
      z
        .object({
          name: z.string(),
          value: z.string(),
          inline: optionalBoolean,
        })
        .passthrough(),
    ),
    footer: optionalObject({ text: optionalString, iconUrl: optionalString }),
    timestamp: optionalString,
  })
  .passthrough();

export const MESSAGE_STICKER_SCHEMA = z
  .object({
    id: z.string(),
    name: z.string(),
    formatType: optionalNumber,
    url: optionalString,
  })
  .passthrough();

export const MESSAGE_ATTACHMENT_SCHEMA = z
  .object({
    url: z.string(),
    name: z.string().catch(''),
    type: z.string().catch(''),
    size: z.number().catch(0),
    duration: optionalNumber,
  })
  .passthrough();

const MESSAGE_FORWARDED_SNAPSHOT_SCHEMA = optionalObject({
  content: optionalString,
  attachments: lenientList(MESSAGE_ATTACHMENT_SCHEMA),
  embeds: lenientList(MESSAGE_EMBED_SCHEMA),
  stickers: lenientList(MESSAGE_STICKER_SCHEMA),
  poll: MESSAGE_POLL_SCHEMA.optional().catch(undefined),
  createdAt: optionalString,
});

export const MESSAGE_REACTION_SCHEMA = z
  .object({
    senderId: z.string(),
    emoji: optionalString,
    reaction: optionalString,
  })
  .passthrough();

export const TELEGRAM_MESSAGE_DATA_SCHEMA = z
  .object({
    senderName: optionalString,
    messageId: optionalString,
    messageIds: lenientList(z.string()),
    chatType: optionalString,
    contentType: optionalString,
    mediaGroupId: optionalString,
    editedAt: optionalString,
    topicName: optionalString,
    replyTo: optionalObject({
      messageId: z.string(),
      chatId: z.string(),
      senderName: z.string(),
      content: z.string(),
    }),
    reactions: lenientList(
      z
        .object({ key: z.string(), label: z.string(), count: z.number() })
        .passthrough(),
    ),
  })
  .passthrough();

export const MESSAGE_EXTRA_DATA_SCHEMA = z
  .object({
    telegram: TELEGRAM_MESSAGE_DATA_SCHEMA.optional().catch(undefined),
    poll: MESSAGE_POLL_SCHEMA.optional().catch(undefined),
    survey: MESSAGE_SURVEY_SCHEMA.optional().catch(undefined),
    embeds: lenientList(MESSAGE_EMBED_SCHEMA),
    stickers: lenientList(MESSAGE_STICKER_SCHEMA),
    voiceMessage: optionalBoolean,
    forwardedSnapshot: MESSAGE_FORWARDED_SNAPSHOT_SCHEMA,
    forwardedNote: optionalString,
    discordMessageId: optionalString,
    discordDeletedAt: optionalString,
    discordEditedAt: optionalString,
    discordPinned: optionalBoolean,
    reactions: lenientList(MESSAGE_REACTION_SCHEMA),
    forwardedFrom: optionalObject({
      conversationId: z.string(),
      messageId: z.string(),
    }),
  })
  .passthrough()
  .optional()
  .catch(undefined);

export const MESSAGE_KIND_SCHEMA = z
  .enum([
    'text',
    'image',
    'video',
    'audio',
    'file',
    'share',
    'story_mention',
    'story_reply',
    'sticker',
    'voice',
    'forwarded',
    'deleted',
    'unsupported',
  ])
  .optional()
  .catch(undefined);

export const MESSAGE_PROVIDER_DATA_SCHEMA = optionalObject({
  attachmentType: optionalString,
  fallbackReason: optionalString,
  previewText: optionalString,
  previewUrl: optionalString,
  shareType: z.enum(['post', 'reel']).optional().catch(undefined),
  storyUrl: optionalString,
  messageId: optionalString,
});

export const MESSAGE_REPLY_TO_SCHEMA = optionalObject({
  messageId: z.string(),
  content: optionalString,
  authorName: optionalString,
});

export const MESSAGE_DELIVERY_STATUS_SCHEMA = z
  .enum(['sent', 'delivered', 'read', 'deleted'])
  .optional()
  .catch(undefined);
