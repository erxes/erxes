import type { IMessage } from '@/inbox/types/Conversation';
import {
  MESSAGE_ATTACHMENT_SCHEMA,
  MESSAGE_DELIVERY_STATUS_SCHEMA,
  MESSAGE_EXTRA_DATA_SCHEMA,
  MESSAGE_KIND_SCHEMA,
  MESSAGE_PROVIDER_DATA_SCHEMA,
  MESSAGE_REACTION_SCHEMA,
  MESSAGE_REPLY_TO_SCHEMA,
} from '@/inbox/types/messageSchema';

/** Inbox, Facebook and Instagram messages all fit this; JSON fields arrive as `unknown`. */
export type MessageSource = {
  _id: string;
  mid?: string | null;
  conversationId?: string | null;
  userId?: string | null;
  customerId?: string | null;
  content?: string | null;
  contentType?: string | null;
  createdAt?: string | null;
  attachments?: unknown;
  formWidgetData?: unknown;
  extraData?: unknown;
  internal?: boolean | null;
  botData?: unknown;
  fromBot?: boolean | null;
  messageKind?: string | null;
  providerData?: unknown;
  replyTo?: unknown;
  reactions?: unknown;
  deliveryStatus?: string | null;
  expiresAt?: string | null;
};

const parseList = <T>(
  value: unknown,
  parse: (item: unknown) => T | undefined,
): T[] | undefined =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const parsed = parse(item);

        return parsed === undefined ? [] : [parsed];
      })
    : undefined;

const parseAttachment = (value: unknown) => {
  const parsed = MESSAGE_ATTACHMENT_SCHEMA.safeParse(value);

  return parsed.success ? parsed.data : undefined;
};

const parseReaction = (value: unknown) => {
  const parsed = MESSAGE_REACTION_SCHEMA.safeParse(value);

  return parsed.success ? parsed.data : undefined;
};

/** Normalizes a fetched or subscribed message for the renderers. */
export const toMessage = (message: MessageSource): IMessage => ({
  _id: message._id,
  mid: message.mid ?? undefined,
  conversationId: message.conversationId ?? undefined,
  userId: message.userId ?? undefined,
  customerId: message.customerId ?? undefined,
  content: message.content ?? '',
  contentType: message.contentType ?? undefined,
  createdAt: message.createdAt ?? '',
  attachments: parseList(message.attachments, parseAttachment),
  formWidgetData: message.formWidgetData ?? undefined,
  extraData: MESSAGE_EXTRA_DATA_SCHEMA.parse(message.extraData ?? undefined),
  internal: message.internal ?? undefined,
  botData: Array.isArray(message.botData) ? message.botData : undefined,
  fromBot: message.fromBot ?? undefined,
  messageKind: MESSAGE_KIND_SCHEMA.parse(message.messageKind ?? undefined),
  providerData: MESSAGE_PROVIDER_DATA_SCHEMA.parse(
    message.providerData ?? undefined,
  ),
  replyTo: MESSAGE_REPLY_TO_SCHEMA.parse(message.replyTo ?? undefined),
  reactions: parseList(message.reactions, parseReaction),
  deliveryStatus: MESSAGE_DELIVERY_STATUS_SCHEMA.parse(
    message.deliveryStatus ?? undefined,
  ),
  expiresAt: message.expiresAt ?? undefined,
});
