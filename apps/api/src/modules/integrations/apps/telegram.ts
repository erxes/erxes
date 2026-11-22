import { TELEGRAM_PARSE_MODES } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { safeEqual } from '~/lib/crypto';
import { defineIntegration, secret } from '../define';
import { type AppHooks, appAction, DeliveryRefused, hookTrigger } from '../appDefinition';
import { gatewayHttp, json, parse, Text } from '../gateways/http';
import { GatewayError } from '../gateways/types';
import {
  BUTTON_OUTPUTS,
  CONTACT_OUTPUTS,
  INLINE_OUTPUTS,
  JOIN_OUTPUTS,
  MEMBER_OUTPUTS,
  MESSAGE_OUTPUTS,
  PAYMENT_OUTPUTS,
  POLL_OUTPUTS,
  updateEvent,
} from './telegramUpdates';

const keys = z.object({
  botToken: secret(
    'Bot token',
    z
      .string()
      .trim()
      .regex(/^\d+:[\w-]+$/, 'the token BotFather gave, like 123456:ABC-DEF'),
  ),
});

type TelegramKeys = z.output<typeof keys>;

const Failure = z.object({ ok: z.literal(false), description: z.string() });

const Bot = z.object({ id: Text });

const failed = (status: number | null, description: string) =>
  new GatewayError(
    status === 401 || status === 404
      ? 'Telegram did not accept the bot token'
      : `Telegram: ${description}`,
    status,
  );

const telegramFetch = async (input: string | URL | Request, init?: RequestInit) => {
  const response = await globalThis.fetch(input, init);

  if (response.ok) return response;

  const failure = Failure.safeParse(await response.json().catch(() => null));

  throw failed(response.status, failure.success ? failure.data.description : response.statusText);
};

const call = async <T>(
  { botToken }: TelegramKeys,
  method: string,
  result: z.ZodType<T>,
  body?: Record<string, unknown>,
) => {
  const text = await gatewayHttp('Telegram', `https://api.telegram.org/bot${botToken}`, {
    fetch: telegramFetch,
  })(`/${method}`, { method: 'POST', body: body ? json(body) : undefined });

  const answer = parse(
    'Telegram',
    z.union([z.object({ ok: z.literal(true), result }), Failure]),
    text,
    `an unreadable ${method} answer`,
  );

  if (!answer.ok) throw failed(null, answer.description);

  return answer.result;
};

const tokenGone = (error: unknown) =>
  error instanceof GatewayError && (error.status === 401 || error.status === 404);

const hooks: AppHooks<TelegramKeys> = {
  scope: z.object({}),
  async subscribe({ keys: bot, url, secret: token, events }) {
    const me = await call(bot, 'getMe', Bot);

    await call(bot, 'setWebhook', z.boolean(), {
      url,
      secret_token: token,
      allowed_updates: events,
      drop_pending_updates: false,
    });

    return { externalId: me.id };
  },
  async unsubscribe({ keys: bot }) {
    try {
      await call(bot, 'deleteWebhook', z.boolean());
    } catch (error) {
      if (!tokenGone(error)) throw error;
    }
  },
  receive(delivery, token) {
    if (!safeEqual(delivery.headers['x-telegram-bot-api-secret-token'] ?? '', token))
      throw new DeliveryRefused('the Telegram secret token does not match');

    const event = updateEvent(delivery.body);

    return { events: event ? [event] : [] };
  },
};

const status = (joined: boolean) => (payload: Record<string, unknown>) =>
  payload.isMember === joined && payload.wasMember === !joined;

const TRIGGERS = [
  hookTrigger({
    key: 'message_received',
    on: 'message',
    label: 'Message received',
    description: 'Someone sends the bot a message, or posts in a group it is in',
    outputs: MESSAGE_OUTPUTS,
  }),
  hookTrigger({
    key: 'message_edited',
    on: 'edited_message',
    label: 'Message edited',
    description: 'Someone edits a message the bot received',
    outputs: MESSAGE_OUTPUTS,
  }),
  hookTrigger({
    key: 'contact_shared',
    on: 'message',
    when: (payload) => typeof payload.phoneNumber === 'string',
    label: 'Contact shared',
    description: 'Someone sends the bot a phone number, as with a "Share my number" button',
    outputs: CONTACT_OUTPUTS,
  }),
  hookTrigger({
    key: 'payment_received',
    on: 'message',
    when: (payload) => typeof payload.totalAmount === 'number',
    label: 'Payment received',
    description: 'Someone pays an invoice the bot sent',
    outputs: PAYMENT_OUTPUTS,
  }),
  hookTrigger({
    key: 'button_pressed',
    on: 'callback_query',
    label: 'Button pressed',
    description: 'Someone presses an inline button under a bot message',
    outputs: BUTTON_OUTPUTS,
  }),
  hookTrigger({
    key: 'channel_post',
    on: 'channel_post',
    label: 'Channel post',
    description: 'A post appears in a channel the bot administers',
    outputs: MESSAGE_OUTPUTS,
  }),
  hookTrigger({
    key: 'channel_post_edited',
    on: 'edited_channel_post',
    label: 'Channel post edited',
    description: 'A post is edited in a channel the bot administers',
    outputs: MESSAGE_OUTPUTS,
  }),
  hookTrigger({
    key: 'inline_query',
    on: 'inline_query',
    label: 'Inline query',
    description: 'Someone types @yourbot and a query in any chat (inline mode on in BotFather)',
    outputs: INLINE_OUTPUTS,
  }),
  hookTrigger({
    key: 'poll_answered',
    on: 'poll_answer',
    label: 'Poll answered',
    description: 'Someone votes in a non-anonymous poll the bot sent',
    outputs: POLL_OUTPUTS,
  }),
  hookTrigger({
    key: 'join_requested',
    on: 'chat_join_request',
    label: 'Join request',
    description: 'Someone asks to join a group or channel where the bot is an admin',
    outputs: JOIN_OUTPUTS,
  }),
  hookTrigger({
    key: 'member_joined',
    on: 'chat_member',
    when: status(true),
    label: 'Member joined',
    description: 'Someone joins a group or channel where the bot is an admin',
    outputs: MEMBER_OUTPUTS,
  }),
  hookTrigger({
    key: 'member_left',
    on: 'chat_member',
    when: status(false),
    label: 'Member left',
    description: 'Someone leaves or is removed from a group or channel where the bot is an admin',
    outputs: MEMBER_OUTPUTS,
  }),
  hookTrigger({
    key: 'bot_added',
    on: 'my_chat_member',
    when: status(true),
    label: 'Bot added to a chat',
    description: 'The bot is added to a group or channel, or someone unblocks it',
    outputs: MEMBER_OUTPUTS,
  }),
  hookTrigger({
    key: 'bot_removed',
    on: 'my_chat_member',
    when: status(false),
    label: 'Bot removed from a chat',
    description: 'The bot is removed from a group or channel, or someone blocks it',
    outputs: MEMBER_OUTPUTS,
  }),
];

const MessageInput = z.object({
  chatId: Text.pipe(z.string().trim().min(1).max(100)),
  text: Text.pipe(z.string().min(1).max(4096)),
  parseMode: z.enum(TELEGRAM_PARSE_MODES).optional(),
});

const sendMessage = appAction<TelegramKeys, z.output<typeof MessageInput>>({
  key: 'send_message',
  label: 'Send a message',
  description: 'The bot sends a message to a chat',
  fields: [
    {
      key: 'chatId',
      label: 'Chat id',
      type: 'text',
      required: true,
      placeholder: '{{event.payload.chatId}}',
      description: 'A chat id, or @username of a channel',
    },
    { key: 'text', label: 'Message', type: 'longtext', required: true },
    {
      key: 'parseMode',
      label: 'Formatting',
      type: 'select',
      required: false,
      options: [
        { value: 'MarkdownV2', label: 'Markdown' },
        { value: 'HTML', label: 'HTML' },
      ],
    },
  ],
  outputs: [{ key: 'messageId', label: 'Message id', type: 'number' }],
  input: MessageInput,
  async run({ client: bot, input }) {
    const sent = await call(bot, 'sendMessage', z.object({ message_id: z.int() }), {
      chat_id: input.chatId,
      text: input.text,
      parse_mode: input.parseMode,
    });

    return { messageId: sent.message_id };
  },
});

export const telegram = defineIntegration({
  key: 'telegram',
  name: 'Telegram',
  summary: 'Start automations from what people send your Telegram bot.',
  category: 'messaging',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://t.me/BotFather',
  keys,
  client: (bot) => bot,
  async verify(bot) {
    await call(bot, 'getMe', Bot);
  },
  hooks,
  triggers: TRIGGERS,
  actions: [sendMessage],
});
