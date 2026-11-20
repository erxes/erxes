import type { META_KINDS } from '@erxes/core-db/integrationEnums';
import type { CoreEventType } from './eventTypes';

type MetaKind = (typeof META_KINDS)[number];

export const META_RECORD_TYPES = {
  facebook: 'facebook_page',
  instagram: 'instagram_account',
} as const satisfies Record<MetaKind, string>;

export const META_EVENTS = {
  messenger: {
    received: 'core.messenger.message_received',
    sent: 'core.messenger.message_sent',
    deleted: 'core.messenger.message_deleted',
    reaction: 'core.messenger.reaction_changed',
  },
  facebook: { comment: 'core.facebook.comment_received' },
  instagram: {
    received: 'core.instagram.message_received',
    sent: 'core.instagram.message_sent',
    deleted: 'core.instagram.message_deleted',
    reaction: 'core.instagram.reaction_changed',
    comment: 'core.instagram.comment_received',
  },
} as const;

const base = (kind: MetaKind) =>
  [
    {
      key: 'connectionId',
      label: kind === 'facebook' ? 'Facebook page' : 'Instagram account',
      type: 'text',
      recordType: META_RECORD_TYPES[kind],
    },
    { key: 'accountId', label: 'Page or account id', type: 'text' },
    { key: 'senderId', label: 'Sender id', type: 'text' },
    { key: 'threadId', label: 'Thread', type: 'text' },
    { key: 'sentAt', label: 'Sent at', type: 'date' },
  ] as const;

const messageFields = (kind: MetaKind) =>
  [
    ...base(kind),
    { key: 'recipientId', label: 'Recipient id', type: 'text' },
    { key: 'messageId', label: 'Message id', type: 'text' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'payload', label: 'Button or quick reply payload', type: 'text' },
    { key: 'postbackTitle', label: 'Button tapped', type: 'text' },
    { key: 'replyToMessageId', label: 'Replies to message', type: 'text' },
    { key: 'storyUrl', label: 'Replies to story', type: 'text' },
    { key: 'attachments', label: 'Attachments', type: 'list' },
  ] as const;

const sentFields = (kind: MetaKind) =>
  [
    ...base(kind),
    { key: 'recipientId', label: 'Recipient id', type: 'text' },
    { key: 'messageId', label: 'Message id', type: 'text' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'appId', label: 'Sent by app', type: 'text' },
    { key: 'attachments', label: 'Attachments', type: 'list' },
  ] as const;

const deletedFields = (kind: MetaKind) =>
  [...base(kind), { key: 'messageId', label: 'Message id', type: 'text' }] as const;

const reactionFields = (kind: MetaKind) =>
  [
    ...base(kind),
    { key: 'messageId', label: 'Message id', type: 'text' },
    { key: 'reaction', label: 'Reaction', type: 'text' },
    { key: 'emoji', label: 'Emoji', type: 'text' },
    { key: 'action', label: 'Reacted or took it back', type: 'text' },
  ] as const;

const commentFields = (kind: MetaKind) =>
  [
    ...base(kind),
    { key: 'postId', label: 'Post', type: 'text' },
    { key: 'commentId', label: 'Comment id', type: 'text' },
    { key: 'parentId', label: 'Replies to comment', type: 'text' },
    { key: 'senderName', label: 'Sender name', type: 'text' },
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'attachments', label: 'Attachments', type: 'list' },
  ] as const;

const chatEvents = (
  kind: MetaKind,
  types: Omit<typeof META_EVENTS.messenger | typeof META_EVENTS.instagram, 'comment'>,
  where: string,
) =>
  [
    {
      type: types.received,
      label: 'Message received',
      subject: 'customer',
      description: `A person writes to a connected ${where}, or taps a button or quick reply`,
      record: 'Message',
      fields: messageFields(kind),
    },
    {
      type: types.sent,
      label: 'Message sent',
      subject: 'customer',
      description: `The ${where} sent a message, from erxes or from Meta's own apps`,
      record: 'Message',
      fields: sentFields(kind),
    },
    {
      type: types.deleted,
      label: 'Message deleted',
      subject: 'customer',
      description: `A person removes a message they sent to the ${where}`,
      record: 'Message',
      fields: deletedFields(kind),
    },
    {
      type: types.reaction,
      label: 'Reaction changed',
      subject: 'customer',
      description: `A person reacts to a message in the ${where}'s chat, or takes it back`,
      record: 'Message',
      fields: reactionFields(kind),
    },
  ] as const satisfies readonly CoreEventType[];

export const META_EVENT_TYPES = [
  ...chatEvents('facebook', META_EVENTS.messenger, 'Facebook page'),
  {
    type: META_EVENTS.facebook.comment,
    label: 'Comment received',
    subject: 'customer',
    description: "A person comments on a connected page's post",
    record: 'Comment',
    fields: commentFields('facebook'),
  },
  ...chatEvents('instagram', META_EVENTS.instagram, 'Instagram account'),
  {
    type: META_EVENTS.instagram.comment,
    label: 'Comment received',
    subject: 'customer',
    description: "A person comments on a connected account's post",
    record: 'Comment',
    fields: commentFields('instagram'),
  },
] as const satisfies readonly CoreEventType[];
