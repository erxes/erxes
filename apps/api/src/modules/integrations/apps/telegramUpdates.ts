import type { DataField } from '@erxes/core-contract';
import { z } from 'zod';
import { Text } from '@erxes/plugin-sdk/integrations';

const User = z.object({
  id: Text,
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
});

const Chat = z.object({
  id: Text,
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
});

const Message = z.looseObject({
  message_id: Text,
  date: z.number(),
  chat: Chat,
  from: User.optional(),
  text: z.string().optional(),
  caption: z.string().optional(),
  contact: z
    .object({
      phone_number: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      user_id: Text.optional(),
    })
    .optional(),
  successful_payment: z
    .object({
      currency: z.string(),
      total_amount: z.number(),
      invoice_payload: z.string().optional(),
      telegram_payment_charge_id: z.string().optional(),
    })
    .optional(),
});

const Member = z.object({ status: z.string(), user: User, is_member: z.boolean().optional() });

const MESSAGE_KINDS = [
  'text',
  'animation',
  'photo',
  'video',
  'video_note',
  'voice',
  'audio',
  'document',
  'sticker',
  'contact',
  'venue',
  'location',
  'poll',
  'dice',
  'successful_payment',
];

const IN_CHAT = new Set(['creator', 'administrator', 'member']);

const COMMAND = /^\/(\w+)(?:@\w+)?(?:\s+([\s\S]*))?$/;

const at = (seconds: number) => new Date(seconds * 1000).toISOString();

const fromOf = (user: z.output<typeof User> | undefined) => ({
  fromId: user?.id ?? null,
  fromUsername: user?.username ?? null,
  firstName: user?.first_name ?? null,
  lastName: user?.last_name ?? null,
  languageCode: user?.language_code ?? null,
});

const chatOf = (chat: z.output<typeof Chat> | undefined) => ({
  chatId: chat?.id ?? null,
  chatType: chat?.type ?? null,
  chatTitle: chat?.title ?? null,
  chatUsername: chat?.username ?? null,
});

const messageFields = (message: z.output<typeof Message>) => {
  const text = message.text ?? message.caption ?? null;
  const command = message.text ? COMMAND.exec(message.text) : null;

  return {
    messageId: message.message_id,
    date: at(message.date),
    text,
    messageKind: MESSAGE_KINDS.find((kind) => message[kind] !== undefined) ?? 'other',
    command: command?.[1] ?? null,
    commandArgs: command?.[2]?.trim() || null,
    ...chatOf(message.chat),
    ...fromOf(message.from),
    phoneNumber: message.contact?.phone_number ?? null,
    contactFirstName: message.contact?.first_name ?? null,
    contactLastName: message.contact?.last_name ?? null,
    contactUserId: message.contact?.user_id ?? null,
    currency: message.successful_payment?.currency ?? null,
    totalAmount: message.successful_payment?.total_amount ?? null,
    invoicePayload: message.successful_payment?.invoice_payload ?? null,
    paymentChargeId: message.successful_payment?.telegram_payment_charge_id ?? null,
  };
};

const inChat = (member: z.output<typeof Member>) =>
  IN_CHAT.has(member.status) || (member.status === 'restricted' && member.is_member === true);

const MessageUpdate = Message.transform(messageFields);

const FLATTENERS = new Map<string, z.ZodType<Record<string, unknown>>>([
  ['message', MessageUpdate],
  ['edited_message', MessageUpdate],
  ['channel_post', MessageUpdate],
  ['edited_channel_post', MessageUpdate],
  [
    'callback_query',
    z
      .object({
        id: z.string(),
        from: User,
        data: z.string().optional(),
        inline_message_id: z.string().optional(),
        message: z.object({ message_id: Text, chat: Chat }).optional(),
      })
      .transform((query) => ({
        callbackQueryId: query.id,
        data: query.data ?? null,
        messageId: query.message?.message_id ?? null,
        inlineMessageId: query.inline_message_id ?? null,
        ...chatOf(query.message?.chat),
        ...fromOf(query.from),
      })),
  ],
  [
    'inline_query',
    z
      .object({
        id: z.string(),
        from: User,
        query: z.string(),
        offset: z.string().optional(),
        chat_type: z.string().optional(),
      })
      .transform((query) => ({
        inlineQueryId: query.id,
        query: query.query,
        offset: query.offset ?? null,
        chatType: query.chat_type ?? null,
        ...fromOf(query.from),
      })),
  ],
  [
    'poll_answer',
    z
      .object({ poll_id: z.string(), user: User.optional(), option_ids: z.array(Text) })
      .transform((answer) => ({
        pollId: answer.poll_id,
        optionIds: answer.option_ids,
        ...fromOf(answer.user),
      })),
  ],
  [
    'chat_join_request',
    z
      .object({
        chat: Chat,
        from: User,
        date: z.number(),
        bio: z.string().optional(),
        invite_link: z.object({ invite_link: z.string(), name: z.string().optional() }).optional(),
      })
      .transform((request) => ({
        date: at(request.date),
        bio: request.bio ?? null,
        inviteLink: request.invite_link?.invite_link ?? null,
        inviteLinkName: request.invite_link?.name ?? null,
        ...chatOf(request.chat),
        ...fromOf(request.from),
      })),
  ],
  ...['my_chat_member', 'chat_member'].map(
    (kind) =>
      [
        kind,
        z
          .object({
            chat: Chat,
            from: User,
            date: z.number(),
            old_chat_member: Member,
            new_chat_member: Member,
          })
          .transform((change) => ({
            date: at(change.date),
            memberId: change.new_chat_member.user.id,
            memberUsername: change.new_chat_member.user.username ?? null,
            memberFirstName: change.new_chat_member.user.first_name ?? null,
            memberLastName: change.new_chat_member.user.last_name ?? null,
            status: change.new_chat_member.status,
            oldStatus: change.old_chat_member.status,
            isMember: inChat(change.new_chat_member),
            wasMember: inChat(change.old_chat_member),
            ...chatOf(change.chat),
            ...fromOf(change.from),
          })),
      ] as const,
  ),
]);

const Update = z.looseObject({ update_id: z.number().int() });

export const updateEvent = (body: unknown) => {
  const update = Update.safeParse(body);

  if (!update.success) return null;

  const kind = Object.keys(update.data).find((key) => key !== 'update_id');

  if (!kind) return null;

  const flat = FLATTENERS.get(kind)?.safeParse(update.data[kind]);

  return {
    id: String(update.data.update_id),
    type: kind,
    payload: {
      ...(flat?.success ? flat.data : {}),
      updateId: update.data.update_id,
      update: update.data,
    },
  };
};

const FROM: DataField[] = [
  { key: 'fromId', label: 'Sender id', type: 'text' },
  { key: 'fromUsername', label: 'Sender username', type: 'text' },
  { key: 'firstName', label: 'First name', type: 'text' },
  { key: 'lastName', label: 'Last name', type: 'text' },
  { key: 'languageCode', label: 'Language', type: 'text' },
];

const CHAT: DataField[] = [
  { key: 'chatId', label: 'Chat id', type: 'text' },
  { key: 'chatType', label: 'Chat type (private, group, supergroup, channel)', type: 'text' },
  { key: 'chatTitle', label: 'Chat title', type: 'text' },
  { key: 'chatUsername', label: 'Chat username', type: 'text' },
];

export const MESSAGE_OUTPUTS: DataField[] = [
  { key: 'messageId', label: 'Message id', type: 'text' },
  { key: 'date', label: 'Sent at', type: 'date' },
  { key: 'text', label: 'Text or caption', type: 'text' },
  { key: 'messageKind', label: 'Kind (text, photo, document, …)', type: 'text' },
  { key: 'command', label: 'Command, without the /', type: 'text' },
  { key: 'commandArgs', label: 'Text after the command', type: 'text' },
  ...CHAT,
  ...FROM,
];

export const CONTACT_OUTPUTS: DataField[] = [
  ...MESSAGE_OUTPUTS,
  { key: 'phoneNumber', label: 'Phone number', type: 'text' },
  { key: 'contactFirstName', label: 'Contact first name', type: 'text' },
  { key: 'contactLastName', label: 'Contact last name', type: 'text' },
  { key: 'contactUserId', label: 'Contact Telegram id', type: 'text' },
];

export const PAYMENT_OUTPUTS: DataField[] = [
  ...MESSAGE_OUTPUTS,
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'totalAmount', label: 'Amount (smallest unit)', type: 'number' },
  { key: 'invoicePayload', label: 'Invoice payload', type: 'text' },
  { key: 'paymentChargeId', label: 'Telegram charge id', type: 'text' },
];

export const BUTTON_OUTPUTS: DataField[] = [
  { key: 'callbackQueryId', label: 'Button press id', type: 'text' },
  { key: 'data', label: 'Button data', type: 'text' },
  { key: 'messageId', label: 'Message id', type: 'text' },
  { key: 'inlineMessageId', label: 'Inline message id', type: 'text' },
  ...CHAT,
  ...FROM,
];

export const INLINE_OUTPUTS: DataField[] = [
  { key: 'inlineQueryId', label: 'Query id', type: 'text' },
  { key: 'query', label: 'Query text', type: 'text' },
  { key: 'offset', label: 'Offset', type: 'text' },
  { key: 'chatType', label: 'Chat type', type: 'text' },
  ...FROM,
];

export const POLL_OUTPUTS: DataField[] = [
  { key: 'pollId', label: 'Poll id', type: 'text' },
  { key: 'optionIds', label: 'Chosen options (empty when the vote is taken back)', type: 'list' },
  ...FROM,
];

export const JOIN_OUTPUTS: DataField[] = [
  { key: 'date', label: 'Asked at', type: 'date' },
  { key: 'bio', label: 'Bio', type: 'text' },
  { key: 'inviteLink', label: 'Invite link', type: 'text' },
  { key: 'inviteLinkName', label: 'Invite link name', type: 'text' },
  ...CHAT,
  ...FROM,
];

export const MEMBER_OUTPUTS: DataField[] = [
  { key: 'date', label: 'Changed at', type: 'date' },
  { key: 'memberId', label: 'Member id', type: 'text' },
  { key: 'memberUsername', label: 'Member username', type: 'text' },
  { key: 'memberFirstName', label: 'Member first name', type: 'text' },
  { key: 'memberLastName', label: 'Member last name', type: 'text' },
  { key: 'status', label: 'Status now', type: 'text' },
  { key: 'oldStatus', label: 'Status before', type: 'text' },
  ...CHAT,
  ...FROM,
];
