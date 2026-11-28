import type { ActionField, DataField } from '@erxes/core-contract';
import { TELEGRAM_PARSE_MODES } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { Text } from '@erxes/plugin-sdk/integrations';

const LINK = /^(https?|tg):\/\/\S+$/i;

const CALLBACK_BYTES = 64;

export const ChatId = Text.pipe(z.string().trim().min(1).max(100));

export const MessageId = z.coerce.number().int().positive();

export const UserId = z.coerce.number().int().positive();

export const ParseMode = z.enum(TELEGRAM_PARSE_MODES).optional();

const ButtonValue = Text.pipe(
  z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .refine(
      (value) => LINK.test(value) || new TextEncoder().encode(value).length <= CALLBACK_BYTES,
      'a link (https://…), or button data of up to 64 bytes',
    ),
);

export const Buttons = z.record(z.string().trim().min(1).max(100), ButtonValue).optional();

export const Delivery = z.object({
  replyTo: MessageId.optional(),
  silent: z.boolean().optional(),
  protect: z.boolean().optional(),
});

export const Sent = z
  .object({ message_id: z.int() })
  .transform((message) => ({ messageId: message.message_id }));

export const SENT_OUTPUTS: DataField[] = [
  { key: 'messageId', label: 'Message id', type: 'number', recordType: 'message' },
];

export const chatField = (label = 'Chat'): ActionField => ({
  key: 'chatId',
  label,
  type: 'plugin_record',
  recordType: 'chat',
  required: true,
  description: "The run's chat, or type a channel's @username",
});

export const messageField = (required: boolean, description?: string): ActionField => ({
  key: 'messageId',
  label: 'Message',
  type: 'plugin_record',
  recordType: 'message',
  required,
  description,
});

export const userField: ActionField = {
  key: 'userId',
  label: 'Person',
  type: 'plugin_record',
  recordType: 'user',
  required: true,
};

export const formattingField: ActionField = {
  key: 'parseMode',
  label: 'Formatting',
  type: 'select',
  required: false,
  options: [
    { value: 'MarkdownV2', label: 'Markdown' },
    { value: 'HTML', label: 'HTML' },
  ],
};

export const buttonsField: ActionField = {
  key: 'buttons',
  label: 'Buttons',
  type: 'key_values',
  required: false,
  description:
    "Each button's text, and a link (https://…) to open or the data the Button pressed trigger gets",
};

export const silentField: ActionField = {
  key: 'silent',
  label: 'Send silently',
  type: 'boolean',
  required: false,
  description: 'People get it without a sound',
};

export const DELIVERY_FIELDS: ActionField[] = [
  {
    key: 'replyTo',
    label: 'Reply to message',
    type: 'plugin_record',
    recordType: 'message',
    required: false,
    description: 'Blank: not a reply',
  },
  silentField,
  {
    key: 'protect',
    label: 'Protect from forwarding and saving',
    type: 'boolean',
    required: false,
  },
];

export const keyboard = (buttons: Record<string, string> | undefined) =>
  buttons && Object.keys(buttons).length
    ? {
        inline_keyboard: Object.entries(buttons).map(([text, value]) => [
          LINK.test(value) ? { text, url: value } : { text, callback_data: value },
        ]),
      }
    : undefined;

export const done = async (answer: Promise<true>) => {
  await answer;

  return {};
};

export const delivery = (input: z.output<typeof Delivery>) => ({
  reply_parameters: input.replyTo
    ? { message_id: input.replyTo, allow_sending_without_reply: true }
    : undefined,
  disable_notification: input.silent,
  protect_content: input.protect,
});
