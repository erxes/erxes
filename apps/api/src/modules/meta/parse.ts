import { META_EVENTS, type MetaKind } from '@erxes/core-contract';
import { META_OBJECTS, META_REACTION_ACTIONS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { logger } from '~/logger';
import type { ConnectionRow } from './connections.service';
import type { Person } from './people';

const log = logger.child({ component: 'meta' });

const File = z.object({ url: z.string(), title: z.string() }).partial();

const Attachments = z.array(z.object({ type: z.string(), payload: File.nullish() })).optional();

const Message = z.object({
  mid: z.string(),
  text: z.string().optional(),
  app_id: z.union([z.number(), z.string()]).optional(),
  is_echo: z.boolean().optional(),
  is_deleted: z.boolean().optional(),
  quick_reply: z.object({ payload: z.string() }).optional(),
  reply_to: z
    .object({ mid: z.string().optional(), story: z.object({ url: z.string() }).optional() })
    .optional(),
  attachments: Attachments,
});

const Messaging = z.object({
  sender: z.object({ id: z.string() }),
  recipient: z.object({ id: z.string() }).optional(),
  timestamp: z.number(),
  message: Message.optional(),
  reaction: z
    .object({
      mid: z.string(),
      action: z.enum(META_REACTION_ACTIONS),
      reaction: z.string().optional(),
      emoji: z.string().optional(),
    })
    .optional(),
  postback: z
    .object({ mid: z.string().optional(), title: z.string(), payload: z.string().optional() })
    .optional(),
});

const FeedChange = z.object({
  field: z.literal('feed'),
  value: z.looseObject({
    item: z.string(),
    verb: z.string(),
    comment_id: z.string().optional(),
    post_id: z.string().optional(),
    parent_id: z.string().optional(),
    message: z.string().optional(),
    photo: z.string().optional(),
    video: z.string().optional(),
    created_time: z.number().optional(),
    from: z.object({ id: z.string(), name: z.string().optional() }).optional(),
  }),
});

const CommentChange = z.object({
  field: z.literal('comments'),
  value: z.object({
    id: z.string(),
    text: z.string().optional(),
    parent_id: z.string().optional(),
    from: z.object({ id: z.string(), username: z.string().optional() }),
    media: z.object({ id: z.string() }),
  }),
});

const Change = z.discriminatedUnion('field', [FeedChange, CommentChange]);

export const MetaDelivery = z.object({
  object: z.enum(META_OBJECTS),
  entry: z.array(
    z.object({
      id: z.string(),
      messaging: z.array(z.unknown()).optional(),
      changes: z.array(z.object({ field: z.string(), value: z.unknown() })).optional(),
    }),
  ),
});

const MetaEvent = z.union([Messaging, z.object({ change: Change })]);

export const kindOfObject = (object: z.infer<typeof MetaDelivery>['object']): MetaKind =>
  object === 'page' ? 'facebook' : 'instagram';

export const eventsOfEntry = (entry: z.infer<typeof MetaDelivery>['entry'][number]) => [
  ...(entry.messaging ?? []),
  ...(entry.changes ?? []).flatMap((change) =>
    Change.safeParse(change).success ? [{ change }] : [],
  ),
];

export interface Item {
  type: string;
  person: Person;
  key: string;
  payload: Record<string, unknown>;
}

type Event = z.infer<typeof Messaging>;

const chatTypes = (kind: MetaKind) =>
  kind === 'facebook' ? META_EVENTS.messenger : META_EVENTS.instagram;

const commentType = (kind: MetaKind) =>
  kind === 'facebook' ? META_EVENTS.facebook.comment : META_EVENTS.instagram.comment;

const attachmentsOf = (attachments: z.infer<typeof Attachments>) =>
  (attachments ?? []).flatMap(({ type, payload }) =>
    payload?.url ? [{ type, url: payload.url, name: payload.title ?? type }] : [],
  );

const sharedOf = (event: Event) => ({
  senderId: event.sender.id,
  threadId: event.sender.id,
  sentAt: new Date(event.timestamp).toISOString(),
});

const postbackItem = (kind: MetaKind, event: Event, postback: NonNullable<Event['postback']>) => {
  const messageId = postback.mid ?? `postback:${event.sender.id}:${event.timestamp}`;

  return {
    type: chatTypes(kind).received,
    person: { externalId: event.sender.id },
    key: `p:${messageId}`,
    payload: {
      ...sharedOf(event),
      recipientId: event.recipient?.id ?? null,
      messageId,
      text: postback.title,
      postbackTitle: postback.title,
      payload: postback.payload ?? null,
      attachments: [],
    },
  };
};

const reactionItem = (kind: MetaKind, event: Event, reaction: NonNullable<Event['reaction']>) => ({
  type: chatTypes(kind).reaction,
  person: { externalId: event.sender.id },
  key: `r:${reaction.mid}:${event.sender.id}:${reaction.action}:${event.timestamp}`,
  payload: {
    ...sharedOf(event),
    messageId: reaction.mid,
    reaction: reaction.reaction ?? null,
    emoji: reaction.emoji ?? null,
    action: reaction.action,
  },
});

const echoItems = (kind: MetaKind, event: Event, message: z.infer<typeof Message>): Item[] => {
  const personId = event.recipient?.id;

  if (!personId) return [];

  return [
    {
      type: chatTypes(kind).sent,
      person: { externalId: personId },
      key: `e:${message.mid}`,
      payload: {
        ...sharedOf(event),
        threadId: personId,
        recipientId: personId,
        messageId: message.mid,
        text: message.text ?? '',
        appId: message.app_id === undefined ? null : String(message.app_id),
        attachments: attachmentsOf(message.attachments),
      },
    },
  ];
};

const messageItem = (kind: MetaKind, event: Event, message: z.infer<typeof Message>) => ({
  type: chatTypes(kind).received,
  person: { externalId: event.sender.id },
  key: `m:${message.mid}`,
  payload: {
    ...sharedOf(event),
    recipientId: event.recipient?.id ?? null,
    messageId: message.mid,
    text: message.text ?? '',
    payload: message.quick_reply?.payload ?? null,
    replyToMessageId: message.reply_to?.mid ?? null,
    storyUrl: message.reply_to?.story?.url ?? null,
    attachments: attachmentsOf(message.attachments),
  },
});

const fromMessaging = (kind: MetaKind, event: Event): Item[] => {
  const { message, postback, reaction } = event;

  if (postback) return [postbackItem(kind, event, postback)];

  if (reaction) return [reactionItem(kind, event, reaction)];

  if (!message) return [];

  if (message.is_echo) return echoItems(kind, event, message);

  if (message.is_deleted)
    return [
      {
        type: chatTypes(kind).deleted,
        person: { externalId: event.sender.id },
        key: `d:${message.mid}`,
        payload: { ...sharedOf(event), messageId: message.mid },
      },
    ];

  return [messageItem(kind, event, message)];
};

const commentThread = (postId: string, authorId: string) => `comment:${postId}:${authorId}`;

const instagramComment = (
  value: z.infer<typeof CommentChange>['value'],
  receivedAt: string,
): Item => ({
  type: commentType('instagram'),
  person: { externalId: value.from.id, name: value.from.username },
  key: `c:${value.id}`,
  payload: {
    senderId: value.from.id,
    senderName: value.from.username ?? null,
    threadId: commentThread(value.media.id, value.from.id),
    sentAt: receivedAt,
    postId: value.media.id,
    commentId: value.id,
    parentId: value.parent_id ?? null,
    text: value.text ?? '',
    attachments: [],
  },
});

const pageComment = (value: z.infer<typeof FeedChange>['value'], receivedAt: string): Item[] => {
  const { comment_id: commentId, post_id: postId, from } = value;

  if (value.item !== 'comment' || value.verb !== 'add' || !commentId || !postId || !from) return [];

  const media = value.photo ?? value.video;

  return [
    {
      type: commentType('facebook'),
      person: { externalId: from.id, name: from.name },
      key: `c:${commentId}`,
      payload: {
        senderId: from.id,
        senderName: from.name ?? null,
        threadId: commentThread(postId, from.id),
        sentAt: value.created_time ? new Date(value.created_time * 1000).toISOString() : receivedAt,
        postId,
        commentId,
        parentId: value.parent_id && value.parent_id !== postId ? value.parent_id : null,
        text: value.message ?? '',
        attachments: media ? [{ type: value.photo ? 'image' : 'video', url: media }] : [],
      },
    },
  ];
};

const fromChange = (accountId: string, change: z.infer<typeof Change>, receivedAt: string) => {
  const items =
    change.field === 'comments'
      ? [instagramComment(change.value, receivedAt)]
      : pageComment(change.value, receivedAt);

  return items.filter((item) => item.person.externalId !== accountId);
};

export const itemsOf = (row: ConnectionRow, events: unknown[], receivedAt: string) =>
  events.flatMap((event) => {
    const read = MetaEvent.safeParse(event);

    if (!read.success) {
      log.warn({ connectionId: row.id, issues: read.error.issues }, 'Meta event left out');

      return [];
    }

    return 'change' in read.data
      ? fromChange(row.externalId, read.data.change, receivedAt)
      : fromMessaging(row.kind, read.data);
  });
