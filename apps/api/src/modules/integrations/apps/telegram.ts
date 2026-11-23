import { z } from 'zod';
import { safeEqual } from '~/lib/crypto';
import {
  defineIntegration,
  type AppHooks,
  DeliveryRefused,
  hookTrigger,
} from '@erxes/plugin-sdk/integrations';
import { Bot, call, keys, type TelegramKeys, tokenGone } from './telegramApi';
import { CHAT_ACTIONS } from './telegramChatActions';
import { MESSAGE_ACTIONS } from './telegramMessageActions';
import { SEND_ACTIONS } from './telegramSendActions';
import {
  BUTTON_OUTPUTS,
  CONTACT_OUTPUTS,
  EDITED_OUTPUTS,
  INLINE_OUTPUTS,
  JOIN_OUTPUTS,
  MEMBER_OUTPUTS,
  MESSAGE_OUTPUTS,
  PAYMENT_OUTPUTS,
  POLL_OUTPUTS,
} from './telegramOutputs';
import { updateEvent } from './telegramUpdates';

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
    outputs: EDITED_OUTPUTS,
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
    outputs: EDITED_OUTPUTS,
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
  actions: [...SEND_ACTIONS, ...MESSAGE_ACTIONS, ...CHAT_ACTIONS],
});
