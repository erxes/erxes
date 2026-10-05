import { z } from 'zod';
import {
  telegramMessageSchema,
  type TelegramMessage,
} from '@/integrations/telegram/utils/message';

const telegramBotSchema = z.object({
  id: z.number().int().positive().safe(),
  is_bot: z.literal(true),
  first_name: z.string(),
  username: z.string().optional(),
  can_join_groups: z.boolean().optional(),
  can_read_all_group_messages: z.boolean().optional(),
});

const telegramGetMeResponseSchema = z.object({
  ok: z.literal(true),
  result: telegramBotSchema,
});

export type TelegramBot = z.infer<typeof telegramBotSchema>;

export const getTelegramResponse = async (
  token: string,
  method: 'getMe' | 'getWebhookInfo' | 'setWebhook' | 'sendMessage',
  params?: Record<string, unknown>,
): Promise<unknown> => {
  if (token !== token.trim() || !/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Enter the bot token exactly as provided by BotFather.');
  }

  let response: Response;

  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: params ? 'POST' : 'GET',
      headers: params ? { 'Content-Type': 'application/json' } : undefined,
      body: params ? JSON.stringify(params) : undefined,
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
  } catch {
    throw new Error('Could not reach Telegram. Please try again.');
  }

  if (response.status === 401 || response.status === 404) {
    throw new Error('Telegram rejected this bot token. Check it in BotFather.');
  }

  if (!response.ok) {
    throw new Error(
      `Telegram request failed (HTTP ${response.status}). Try again.`,
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error('Could not read the Telegram response. Please try again.');
  }

  return body;
};

export const getTelegramBot = async (token: string): Promise<TelegramBot> => {
  const body = await getTelegramResponse(token, 'getMe');
  const parsed = telegramGetMeResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid bot response.',
    );
  }

  return parsed.data.result;
};

const telegramWebhookInfoSchema = z.object({
  url: z.string(),
  has_custom_certificate: z.boolean(),
  pending_update_count: z.number().int().nonnegative(),
  ip_address: z.string().optional(),
  last_error_date: z.number().int().nonnegative().optional(),
  last_error_message: z.string().optional(),
  last_synchronization_error_date: z.number().int().nonnegative().optional(),
  max_connections: z.number().int().positive().optional(),
  allowed_updates: z.array(z.string()).optional(),
});

const telegramGetWebhookInfoResponseSchema = z.object({
  ok: z.literal(true),
  result: telegramWebhookInfoSchema,
});

export type TelegramWebhookInfo = z.infer<typeof telegramWebhookInfoSchema>;

export const getTelegramWebhookInfo = async (
  token: string,
): Promise<TelegramWebhookInfo> => {
  const body = await getTelegramResponse(token, 'getWebhookInfo');
  const parsed = telegramGetWebhookInfoResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid webhook response.',
    );
  }

  return parsed.data.result;
};

const telegramSetWebhookResponseSchema = z.object({
  ok: z.literal(true),
  result: z.literal(true),
});

export const setTelegramWebhook = async (
  token: string,
  url: string,
  webhookSecret: string,
): Promise<boolean> => {
  const parsedUrl = z.string().url().startsWith('https://').safeParse(url);

  if (url !== url.trim() || !parsedUrl.success) {
    throw new Error('Enter a valid HTTPS webhook URL.');
  }

  if (!/^[A-Za-z0-9_-]{1,256}$/.test(webhookSecret)) {
    throw new Error('A valid Telegram webhook secret is required.');
  }

  const body = await getTelegramResponse(token, 'setWebhook', {
    url: parsedUrl.data,
    secret_token: webhookSecret,
    allowed_updates: ['message'],
    drop_pending_updates: false,
  });

  const parsed = telegramSetWebhookResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid webhook registration response.',
    );
  }

  return parsed.data.result;
};

const telegramSendMessageResponseSchema = z.object({
  ok: z.literal(true),
  result: telegramMessageSchema,
});

export const sendTelegramMessage = async (
  token: string,
  chatId: string,
  text: string,
): Promise<TelegramMessage> => {
  if (!/^-?[1-9]\d*$/.test(chatId) || !Number.isSafeInteger(Number(chatId))) {
    throw new Error('A valid Telegram chat ID is required.');
  }

  if (!text.trim() || Array.from(text).length > 4096) {
    throw new Error(
      'Enter a non-empty Telegram message of at most 4096 characters.',
    );
  }

  const body = await getTelegramResponse(token, 'sendMessage', {
    chat_id: chatId,
    text,
  });

  const parsed = telegramSendMessageResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid send-message response.',
    );
  }

  return parsed.data.result;
};
