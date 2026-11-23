import type { ActionField } from '@erxes/core-contract';
import { TELEGRAM_ALBUM_KINDS, TELEGRAM_CHAT_ACTIONS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, Text } from '@erxes/plugin-sdk/integrations';
import { call, type TelegramKeys } from './telegramApi';
import {
  Buttons,
  buttonsField,
  ChatId,
  chatField,
  Delivery,
  delivery,
  DELIVERY_FIELDS,
  done,
  formattingField,
  keyboard,
  ParseMode,
  Sent,
  SENT_OUTPUTS,
} from './telegramFields';

const FileRef = Text.pipe(z.string().trim().min(1).max(2000));

const Caption = Text.pipe(z.string().max(1024)).optional();

const fileField = (label: string): ActionField => ({
  key: 'file',
  label,
  type: 'text',
  required: true,
  placeholder: 'https://…',
  description: 'A public link to the file, or the id of a file Telegram already has',
});

const captionField: ActionField = {
  key: 'caption',
  label: 'Caption',
  type: 'longtext',
  required: false,
};

const captionFields = [captionField, formattingField];

const MessageInput = Delivery.extend({
  chatId: ChatId,
  text: Text.pipe(z.string().min(1).max(4096)),
  parseMode: ParseMode,
  buttons: Buttons,
  noPreview: z.boolean().optional(),
});

const sendMessage = appAction<TelegramKeys, z.output<typeof MessageInput>>({
  key: 'send_message',
  label: 'Send a message',
  description: 'The bot sends a message to a chat',
  fields: [
    chatField(),
    { key: 'text', label: 'Message', type: 'longtext', required: true },
    formattingField,
    buttonsField,
    { key: 'noPreview', label: 'Hide link previews', type: 'boolean', required: false },
    ...DELIVERY_FIELDS,
  ],
  outputs: SENT_OUTPUTS,
  input: MessageInput,
  run: ({ client: bot, input }) =>
    call(bot, 'sendMessage', Sent, {
      chat_id: input.chatId,
      text: input.text,
      parse_mode: input.parseMode,
      reply_markup: keyboard(input.buttons),
      link_preview_options: input.noPreview ? { is_disabled: true } : undefined,
      ...delivery(input),
    }),
});

const MediaInput = Delivery.extend({
  chatId: ChatId,
  file: FileRef,
  caption: Caption,
  parseMode: ParseMode,
  buttons: Buttons,
});

const MEDIA = [
  { kind: 'photo', method: 'sendPhoto', file: 'Photo', what: 'a photo' },
  { kind: 'document', method: 'sendDocument', file: 'File', what: 'a file' },
  { kind: 'video', method: 'sendVideo', file: 'Video', what: 'a video' },
  { kind: 'audio', method: 'sendAudio', file: 'Audio file', what: 'an audio file' },
  { kind: 'animation', method: 'sendAnimation', file: 'GIF', what: 'a GIF' },
] as const;

const media = ({ kind, method, file, what }: (typeof MEDIA)[number]) =>
  appAction<TelegramKeys, z.output<typeof MediaInput>>({
    key: `send_${kind}`,
    label: `Send ${what}`,
    description: `The bot sends ${what} to a chat, from a link`,
    fields: [chatField(), fileField(file), ...captionFields, buttonsField, ...DELIVERY_FIELDS],
    outputs: SENT_OUTPUTS,
    input: MediaInput,
    run: ({ client: bot, input }) =>
      call(bot, method, Sent, {
        chat_id: input.chatId,
        [kind]: input.file,
        caption: input.caption,
        parse_mode: input.parseMode,
        reply_markup: keyboard(input.buttons),
        ...delivery(input),
      }),
  });

const StickerInput = Delivery.extend({ chatId: ChatId, file: FileRef, buttons: Buttons });

const sendSticker = appAction<TelegramKeys, z.output<typeof StickerInput>>({
  key: 'send_sticker',
  label: 'Send a sticker',
  description: 'The bot sends a sticker to a chat',
  fields: [chatField(), fileField('Sticker'), buttonsField, ...DELIVERY_FIELDS],
  outputs: SENT_OUTPUTS,
  input: StickerInput,
  run: ({ client: bot, input }) =>
    call(bot, 'sendSticker', Sent, {
      chat_id: input.chatId,
      sticker: input.file,
      reply_markup: keyboard(input.buttons),
      ...delivery(input),
    }),
});

const LocationInput = Delivery.extend({
  chatId: ChatId,
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  buttons: Buttons,
});

const sendLocation = appAction<TelegramKeys, z.output<typeof LocationInput>>({
  key: 'send_location',
  label: 'Send a location',
  description: 'The bot sends a point on the map to a chat',
  fields: [
    chatField(),
    { key: 'latitude', label: 'Latitude', type: 'number', required: true, placeholder: '47.9185' },
    {
      key: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: true,
      placeholder: '106.9177',
    },
    buttonsField,
    ...DELIVERY_FIELDS,
  ],
  outputs: SENT_OUTPUTS,
  input: LocationInput,
  run: ({ client: bot, input }) =>
    call(bot, 'sendLocation', Sent, {
      chat_id: input.chatId,
      latitude: input.latitude,
      longitude: input.longitude,
      reply_markup: keyboard(input.buttons),
      ...delivery(input),
    }),
});

const AlbumInput = Delivery.extend({
  chatId: ChatId,
  kind: z.enum(TELEGRAM_ALBUM_KINDS).default('photo'),
  files: Text.pipe(
    z
      .string()
      .transform((text) =>
        text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().max(2000)).min(2, 'at least 2 links').max(10, 'at most 10 links')),
  ),
  caption: Caption,
  parseMode: ParseMode,
});

const Album = z.array(z.object({ message_id: z.int() })).transform((messages) => ({
  messageId: messages[0]?.message_id,
  messageIds: messages.map((message) => message.message_id),
}));

const sendAlbum = appAction<TelegramKeys, z.output<typeof AlbumInput>>({
  key: 'send_album',
  label: 'Send an album',
  description: 'The bot sends 2 to 10 photos, videos, documents or audio files as one group',
  fields: [
    chatField(),
    {
      key: 'kind',
      label: 'Files are',
      type: 'select',
      required: false,
      options: [
        { value: 'photo', label: 'Photos' },
        { value: 'video', label: 'Videos' },
        { value: 'document', label: 'Documents' },
        { value: 'audio', label: 'Audio files' },
      ],
    },
    {
      key: 'files',
      label: 'Files',
      type: 'longtext',
      required: true,
      description: 'One public link or Telegram file id per line, 2 to 10 of them',
    },
    { ...captionField, description: 'Shown under the first file' },
    formattingField,
    ...DELIVERY_FIELDS,
  ],
  outputs: [
    { key: 'messageId', label: 'First message id', type: 'number', recordType: 'message' },
    { key: 'messageIds', label: 'Message ids', type: 'list' },
  ],
  input: AlbumInput,
  run: ({ client: bot, input }) =>
    call(bot, 'sendMediaGroup', Album, {
      chat_id: input.chatId,
      media: input.files.map((file, at) => ({
        type: input.kind,
        media: file,
        ...(at === 0 ? { caption: input.caption, parse_mode: input.parseMode } : {}),
      })),
      ...delivery(input),
    }),
});

const ActionInput = z.object({ chatId: ChatId, action: z.enum(TELEGRAM_CHAT_ACTIONS) });

const sendChatAction = appAction<TelegramKeys, z.output<typeof ActionInput>>({
  key: 'send_chat_action',
  label: 'Show the bot is busy',
  description:
    'The chat shows "typing…" or "sending a photo…" for a few seconds, or until the bot sends',
  fields: [
    chatField(),
    {
      key: 'action',
      label: 'Shows',
      type: 'select',
      required: true,
      options: [
        { value: 'typing', label: 'Typing' },
        { value: 'upload_photo', label: 'Sending a photo' },
        { value: 'upload_video', label: 'Sending a video' },
        { value: 'record_video', label: 'Recording a video' },
        { value: 'record_voice', label: 'Recording a voice message' },
        { value: 'upload_voice', label: 'Sending a voice message' },
        { value: 'upload_document', label: 'Sending a file' },
        { value: 'choose_sticker', label: 'Choosing a sticker' },
        { value: 'find_location', label: 'Finding a location' },
        { value: 'record_video_note', label: 'Recording a video message' },
        { value: 'upload_video_note', label: 'Sending a video message' },
      ],
    },
  ],
  input: ActionInput,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'sendChatAction', z.literal(true), {
        chat_id: input.chatId,
        action: input.action,
      }),
    ),
});

export const SEND_ACTIONS = [
  sendMessage,
  ...MEDIA.map(media),
  sendSticker,
  sendLocation,
  sendAlbum,
  sendChatAction,
];
