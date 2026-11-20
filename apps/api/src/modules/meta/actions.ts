import { type ActionField, META_RECORD_TYPES, type MetaKind } from '@erxes/core-contract';
import { type Db, metaConnections, withOrg } from '@erxes/core-db';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import {
  type CallContext,
  type CoreAction,
  idempotencyKey,
  text,
} from '~/modules/automations/actions/context';
import { findConnection } from './connections.service';
import { sendOnce } from './send';

const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

const Trigger = z.object({
  event: z.object({ payload: z.record(z.string(), z.unknown()) }).optional(),
});

const fromTrigger = (ctx: CallContext, key: string) =>
  text(Trigger.safeParse(ctx.context).data?.event?.payload[key]);

const valueOf = (ctx: CallContext, key: string, missing: string, triggerKey?: string) => {
  const value = text(ctx.input[key])?.trim() || (triggerKey && fromTrigger(ctx, triggerKey));

  if (!value) throw fail('INVALID_STEP_INPUT', missing);

  return value;
};

const WHERE: Record<MetaKind, string> = {
  facebook: 'Facebook page',
  instagram: 'Instagram account',
};

const connectionOf = async (ctx: CallContext, kind: MetaKind) => {
  const id = valueOf(ctx, 'connection', `Pick the ${WHERE[kind]}`, 'connectionId');

  return withOrg(ctx.orgId, (tx) => findConnection(tx, id, kind));
};

const connectionField = (kind: MetaKind): ActionField => ({
  key: 'connection',
  label: WHERE[kind],
  type: 'plugin_record',
  recordType: META_RECORD_TYPES[kind],
  required: false,
  description: `Leave empty for the trigger's ${WHERE[kind]}`,
});

const textField: ActionField = { key: 'text', label: 'Message', type: 'longtext', required: true };

const late = (ctx: CallContext) => {
  const sentAt = Date.parse(fromTrigger(ctx, 'sentAt') ?? '');

  return Number.isFinite(sentAt) && Date.now() - sentAt > REPLY_WINDOW_MS;
};

const sendMessage =
  (kind: MetaKind) =>
  async (ctx: CallContext): Promise<unknown> => {
    const row = await connectionOf(ctx, kind);

    const sent = await sendOnce(ctx.orgId, {
      kind: 'message',
      connectionId: row.id,
      idempotencyKey: `automation:${idempotencyKey(ctx)}`,
      recipientId: valueOf(ctx, 'recipientId', 'Who gets the message?', 'senderId'),
      text: valueOf(ctx, 'text', 'Write the message'),
      fileIds: [],
      humanAgent: late(ctx),
    });

    return { messageId: sent.id };
  };

const replyToComment =
  (kind: MetaKind) =>
  async (ctx: CallContext): Promise<unknown> => {
    const row = await connectionOf(ctx, kind);

    const sent = await sendOnce(ctx.orgId, {
      kind: 'comment_reply',
      connectionId: row.id,
      idempotencyKey: `automation:${idempotencyKey(ctx)}`,
      commentId: valueOf(ctx, 'commentId', 'Which comment?', 'commentId'),
      text: valueOf(ctx, 'text', 'Write the reply'),
    });

    return { commentId: sent.id };
  };

const messageFields = (kind: MetaKind): ActionField[] => [
  connectionField(kind),
  {
    key: 'recipientId',
    label: 'To',
    type: 'text',
    required: false,
    placeholder: '{{event.payload.senderId}}',
    description: 'Leave empty to answer the person who wrote',
  },
  textField,
];

const commentFields = (kind: MetaKind): ActionField[] => [
  connectionField(kind),
  {
    key: 'commentId',
    label: 'Comment',
    type: 'text',
    required: false,
    placeholder: '{{event.payload.commentId}}',
    description: "Leave empty for the trigger's comment",
  },
];

export const META_ACTIONS: CoreAction[] = [
  {
    type: 'core.messenger.send_message',
    label: 'Send a Messenger message',
    description: 'As a connected Facebook page, to the person who wrote unless you name another',
    subject: null,
    fields: messageFields('facebook'),
    outputs: [{ key: 'messageId', label: 'Message id', type: 'text' }],
    call: sendMessage('facebook'),
  },
  {
    type: 'core.facebook.reply_to_comment',
    label: 'Reply to the comment',
    description: "As the page, under a person's comment on its post",
    subject: null,
    fields: [...commentFields('facebook'), { ...textField, label: 'Reply' }],
    outputs: [{ key: 'commentId', label: 'Reply id', type: 'text' }],
    call: replyToComment('facebook'),
  },
  {
    type: 'core.facebook.like_comment',
    label: 'Like the comment',
    description: "The page likes a person's comment on its post",
    subject: null,
    fields: commentFields('facebook'),
    call: async (ctx) => {
      const row = await connectionOf(ctx, 'facebook');

      await sendOnce(ctx.orgId, {
        kind: 'comment_like',
        connectionId: row.id,
        idempotencyKey: `automation:${idempotencyKey(ctx)}`,
        commentId: valueOf(ctx, 'commentId', 'Which comment?', 'commentId'),
      });

      return { liked: true };
    },
  },
  {
    type: 'core.instagram.send_message',
    label: 'Send an Instagram message',
    description:
      'As a connected Instagram account, to the person who wrote unless you name another',
    subject: null,
    fields: messageFields('instagram'),
    outputs: [{ key: 'messageId', label: 'Message id', type: 'text' }],
    call: sendMessage('instagram'),
  },
  {
    type: 'core.instagram.reply_to_comment',
    label: 'Reply to the comment',
    description: "As the account, under a person's comment on its post",
    subject: null,
    fields: [...commentFields('instagram'), { ...textField, label: 'Reply' }],
    outputs: [{ key: 'commentId', label: 'Reply id', type: 'text' }],
    call: replyToComment('instagram'),
  },
];

const KIND_OF_RECORD: Record<string, MetaKind> = {
  [META_RECORD_TYPES.facebook]: 'facebook',
  [META_RECORD_TYPES.instagram]: 'instagram',
};

export const metaRecordChoices = async (client: Db, recordType: string) => {
  const kind = KIND_OF_RECORD[recordType];

  if (!kind) return [];

  return client
    .select({ value: metaConnections.id, label: metaConnections.name })
    .from(metaConnections)
    .where(eq(metaConnections.kind, kind))
    .orderBy(asc(metaConnections.name), asc(metaConnections.id));
};
