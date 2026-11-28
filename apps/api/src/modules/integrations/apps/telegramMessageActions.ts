import { z } from 'zod';
import { appAction, Text } from '@erxes/plugin-sdk/integrations';
import { call, type TelegramKeys } from './telegramApi';
import {
  Buttons,
  buttonsField,
  ChatId,
  chatField,
  done,
  formattingField,
  keyboard,
  MessageId,
  messageField,
  ParseMode,
  Sent,
  SENT_OUTPUTS,
  silentField,
} from './telegramFields';

const EditInput = z.object({
  chatId: ChatId,
  messageId: MessageId,
  text: Text.pipe(z.string().min(1).max(4096)),
  parseMode: ParseMode,
  buttons: Buttons,
  noPreview: z.boolean().optional(),
});

const editMessage = appAction<TelegramKeys, z.output<typeof EditInput>>({
  key: 'edit_message',
  label: 'Edit a message',
  description:
    'Change the text of a message the bot sent. Its buttons go unless you list them again.',
  fields: [
    chatField(),
    messageField(true),
    { key: 'text', label: 'New text', type: 'longtext', required: true },
    formattingField,
    buttonsField,
    { key: 'noPreview', label: 'Hide link previews', type: 'boolean', required: false },
  ],
  outputs: SENT_OUTPUTS,
  input: EditInput,
  run: ({ client: bot, input }) =>
    call(bot, 'editMessageText', Sent, {
      chat_id: input.chatId,
      message_id: input.messageId,
      text: input.text,
      parse_mode: input.parseMode,
      reply_markup: keyboard(input.buttons),
      link_preview_options: input.noPreview ? { is_disabled: true } : undefined,
    }),
});

const MessageRef = z.object({ chatId: ChatId, messageId: MessageId });

const deleteMessage = appAction<TelegramKeys, z.output<typeof MessageRef>>({
  key: 'delete_message',
  label: 'Delete a message',
  description:
    "Delete a message from a chat: one the bot sent, or anyone's where the bot is an admin. Telegram allows it for 48 hours.",
  fields: [chatField(), messageField(true)],
  input: MessageRef,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'deleteMessage', z.literal(true), {
        chat_id: input.chatId,
        message_id: input.messageId,
      }),
    ),
});

const PinInput = MessageRef.extend({ silent: z.boolean().optional() });

const pinMessage = appAction<TelegramKeys, z.output<typeof PinInput>>({
  key: 'pin_message',
  label: 'Pin a message',
  description:
    'Pin a message at the top of a chat. In groups and channels the bot must be an admin.',
  fields: [
    chatField(),
    messageField(true),
    { ...silentField, label: 'Pin silently', description: 'Members get no notice' },
  ],
  input: PinInput,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'pinChatMessage', z.literal(true), {
        chat_id: input.chatId,
        message_id: input.messageId,
        disable_notification: input.silent,
      }),
    ),
});

const UnpinInput = z.object({ chatId: ChatId, messageId: MessageId.optional() });

const unpinMessage = appAction<TelegramKeys, z.output<typeof UnpinInput>>({
  key: 'unpin_message',
  label: 'Unpin a message',
  description: 'Unpin a message in a chat. In groups and channels the bot must be an admin.',
  fields: [chatField(), messageField(false, 'Blank: the latest pinned message')],
  input: UnpinInput,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'unpinChatMessage', z.literal(true), {
        chat_id: input.chatId,
        message_id: input.messageId,
      }),
    ),
});

const ForwardInput = z.object({
  fromChatId: ChatId,
  messageId: MessageId,
  chatId: ChatId,
  silent: z.boolean().optional(),
});

const forwardMessage = appAction<TelegramKeys, z.output<typeof ForwardInput>>({
  key: 'forward_message',
  label: 'Forward a message',
  description: 'Forward a message from one chat to another, as from a group to your support team',
  fields: [
    { ...chatField('From chat'), key: 'fromChatId' },
    messageField(true),
    chatField('To chat'),
    silentField,
  ],
  outputs: [
    { key: 'messageId', label: 'Forwarded message id', type: 'number', recordType: 'message' },
  ],
  input: ForwardInput,
  run: ({ client: bot, input }) =>
    call(bot, 'forwardMessage', Sent, {
      chat_id: input.chatId,
      from_chat_id: input.fromChatId,
      message_id: input.messageId,
      disable_notification: input.silent,
    }),
});

const AnswerInput = z.object({
  callbackQueryId: Text.pipe(z.string().trim().min(1).max(200)),
  text: Text.pipe(z.string().max(200)).optional(),
  alert: z.boolean().optional(),
});

const answerButton = appAction<TelegramKeys, z.output<typeof AnswerInput>>({
  key: 'answer_button',
  label: 'Answer a button press',
  description:
    'Stop the loading spinner on a pressed button, and show the person a short notice. Use it right after Button pressed.',
  fields: [
    {
      key: 'callbackQueryId',
      label: 'Button press',
      type: 'plugin_record',
      recordType: 'button_press',
      required: true,
    },
    {
      key: 'text',
      label: 'Notice',
      type: 'text',
      required: false,
      description: 'Up to 200 characters. Blank: no notice.',
    },
    {
      key: 'alert',
      label: 'Show as a popup',
      type: 'boolean',
      required: false,
      description: 'Off: a notice at the top of the chat that goes away',
    },
  ],
  input: AnswerInput,
  run: ({ client: bot, input }) =>
    done(
      call(bot, 'answerCallbackQuery', z.literal(true), {
        callback_query_id: input.callbackQueryId,
        text: input.text,
        show_alert: input.alert,
      }),
    ),
});

export const MESSAGE_ACTIONS = [
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  forwardMessage,
  answerButton,
];
