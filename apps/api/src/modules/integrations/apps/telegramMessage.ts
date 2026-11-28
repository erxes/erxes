import { z } from 'zod';
import { Text } from '@erxes/plugin-sdk/integrations';
import { at, Chat, chatOf, fromOf, nameOf, User } from './telegramUsers';

const File = z.object({
  file_id: z.string(),
  file_unique_id: z.string().optional(),
  file_name: z.string().optional(),
  mime_type: z.string().optional(),
  file_size: z.number().optional(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const Entity = z.object({
  type: z.string(),
  offset: z.number().int(),
  length: z.number().int(),
  url: z.string().optional(),
});

const Origin = z.object({
  type: z.string(),
  date: z.number(),
  sender_user: User.optional(),
  sender_user_name: z.string().optional(),
  sender_chat: Chat.optional(),
  chat: Chat.optional(),
  message_id: Text.optional(),
});

const Location = z.object({
  latitude: z.number(),
  longitude: z.number(),
  live_period: z.number().optional(),
});

const Media = z.object({
  photo: z.array(File).optional(),
  animation: File.optional(),
  video: File.optional(),
  video_note: File.optional(),
  voice: File.optional(),
  audio: File.extend({
    performer: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
  document: File.optional(),
  sticker: File.extend({
    emoji: z.string().optional(),
    set_name: z.string().optional(),
  }).optional(),
});

export const Message = z.looseObject({
  ...Media.shape,
  message_id: Text,
  message_thread_id: Text.optional(),
  media_group_id: z.string().optional(),
  date: z.number(),
  edit_date: z.number().optional(),
  chat: Chat,
  from: User.optional(),
  sender_chat: Chat.optional(),
  author_signature: z.string().optional(),
  text: z.string().optional(),
  caption: z.string().optional(),
  entities: z.array(Entity).optional(),
  caption_entities: z.array(Entity).optional(),
  reply_to_message: z
    .looseObject({
      message_id: Text,
      text: z.string().optional(),
      caption: z.string().optional(),
      from: User.optional(),
    })
    .optional(),
  quote: z.object({ text: z.string() }).optional(),
  forward_origin: Origin.optional(),
  contact: z
    .object({
      phone_number: z.string(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      user_id: Text.optional(),
    })
    .optional(),
  location: Location.optional(),
  venue: z.object({ title: z.string(), address: z.string() }).optional(),
  poll: z
    .object({
      id: z.string(),
      question: z.string(),
      type: z.string().optional(),
      options: z.array(z.object({ text: z.string() })),
    })
    .optional(),
  dice: z.object({ emoji: z.string(), value: z.number() }).optional(),
  web_app_data: z.object({ data: z.string(), button_text: z.string() }).optional(),
  successful_payment: z
    .object({
      currency: z.string(),
      total_amount: z.number(),
      invoice_payload: z.string().optional(),
      telegram_payment_charge_id: z.string().optional(),
      provider_payment_charge_id: z.string().optional(),
      order_info: z
        .object({
          name: z.string().optional(),
          phone_number: z.string().optional(),
          email: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

type Parsed = z.output<typeof Message>;

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
  'web_app_data',
  'new_chat_members',
  'left_chat_member',
] as const;

const COMMAND = /^\/(\w+)(?:@\w+)?(?:\s+([\s\S]*))?$/;

const listOrNone = (items: string[]) => (items.length ? items : undefined);

const area = (file: z.output<typeof File>) => (file.width ?? 0) * (file.height ?? 0);

const largest = (sizes: z.output<typeof File>[] | undefined) =>
  sizes?.toSorted((a, b) => area(a) - area(b)).at(-1);

const mediaFields = (message: Parsed) => {
  const file =
    message.animation ??
    largest(message.photo) ??
    message.video ??
    message.video_note ??
    message.voice ??
    message.audio ??
    message.sticker ??
    message.document;

  return {
    fileId: file?.file_id,
    fileUniqueId: file?.file_unique_id,
    fileName: file?.file_name,
    mimeType: file?.mime_type,
    fileSize: file?.file_size,
    duration: file?.duration,
    width: file?.width,
    height: file?.height,
    audioPerformer: message.audio?.performer,
    audioTitle: message.audio?.title,
    stickerEmoji: message.sticker?.emoji,
    stickerSet: message.sticker?.set_name,
  };
};

const entityFields = (message: Parsed) => {
  const text = message.text ?? message.caption ?? '';
  const entities = message.entities ?? message.caption_entities ?? [];

  const pick = (...types: string[]) =>
    listOrNone(
      entities
        .filter((entity) => types.includes(entity.type))
        .map((entity) => entity.url ?? text.slice(entity.offset, entity.offset + entity.length)),
    );

  return {
    hashtags: pick('hashtag'),
    mentions: pick('mention'),
    links: pick('url', 'text_link'),
    emails: pick('email'),
  };
};

const contextFields = (message: Parsed) => {
  const origin = message.forward_origin;
  const forwardChat = origin?.chat ?? origin?.sender_chat;

  return {
    threadId: message.message_thread_id,
    albumId: message.media_group_id,
    editedAt: at(message.edit_date),
    senderChatId: message.sender_chat?.id,
    senderChatTitle: message.sender_chat?.title,
    authorSignature: message.author_signature,
    replyToMessageId: message.reply_to_message?.message_id,
    replyToText: message.reply_to_message?.text ?? message.reply_to_message?.caption,
    replyToFromId: message.reply_to_message?.from?.id,
    quoteText: message.quote?.text,
    forwardType: origin?.type,
    forwardDate: at(origin?.date),
    forwardFromId: origin?.sender_user?.id,
    forwardFromName: nameOf(origin?.sender_user) ?? origin?.sender_user_name,
    forwardChatId: forwardChat?.id,
    forwardChatTitle: forwardChat?.title,
    forwardMessageId: origin?.message_id,
  };
};

const contentFields = (message: Parsed) => {
  const place = message.location;
  const pay = message.successful_payment;

  return {
    latitude: place?.latitude,
    longitude: place?.longitude,
    livePeriod: place?.live_period,
    venueTitle: message.venue?.title,
    venueAddress: message.venue?.address,
    pollId: message.poll?.id,
    pollQuestion: message.poll?.question,
    pollType: message.poll?.type,
    pollOptions: message.poll?.options.map((option) => option.text),
    diceEmoji: message.dice?.emoji,
    diceValue: message.dice?.value,
    webAppData: message.web_app_data?.data,
    webAppButton: message.web_app_data?.button_text,
    phoneNumber: message.contact?.phone_number,
    contactFirstName: message.contact?.first_name,
    contactLastName: message.contact?.last_name,
    contactUserId: message.contact?.user_id,
    currency: pay?.currency,
    totalAmount: pay?.total_amount,
    invoicePayload: pay?.invoice_payload,
    paymentChargeId: pay?.telegram_payment_charge_id,
    providerChargeId: pay?.provider_payment_charge_id,
    payerName: pay?.order_info?.name,
    payerPhone: pay?.order_info?.phone_number,
    payerEmail: pay?.order_info?.email,
  };
};

export const messageFields = (message: Parsed) => {
  const command = message.text ? COMMAND.exec(message.text) : null;

  return {
    messageId: message.message_id,
    date: at(message.date),
    text: message.text ?? message.caption,
    messageKind: MESSAGE_KINDS.find((kind) => message[kind] !== undefined) ?? 'other',
    command: command?.[1],
    commandArgs: command?.[2]?.trim() || undefined,
    ...chatOf(message.chat),
    ...fromOf(message.from),
    ...contextFields(message),
    ...entityFields(message),
    ...mediaFields(message),
    ...contentFields(message),
  };
};
