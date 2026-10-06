import { z } from 'zod';
import { TelegramFileTooLargeError } from './utils/fileLimits';
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
  method:
    | 'getMe'
    | 'getWebhookInfo'
    | 'setWebhook'
    | 'deleteWebhook'
    | 'sendMessage'
    | 'sendPhoto'
    | 'sendDocument'
    | 'sendVideo'
    | 'sendAudio'
    | 'sendVoice'
    | 'sendAnimation'
    | 'sendMediaGroup'
    | 'sendPoll'
    | 'getFile',
  params?: Record<string, unknown> | FormData,
): Promise<unknown> => {
  if (token !== token.trim() || !/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Enter the bot token exactly as provided by BotFather.');
  }

  let response: Response;

  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: params ? 'POST' : 'GET',
      headers:
        params && !(params instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : undefined,
      body:
        params instanceof FormData
          ? params
          : params
            ? JSON.stringify(params)
            : undefined,
      signal: AbortSignal.timeout(params instanceof FormData ? 60_000 : 10_000),
      redirect: 'error',
    });
  } catch {
    throw new Error(
      method.startsWith('send')
        ? 'Telegram delivery could not be confirmed. Check the chat before trying again.'
        : 'Could not reach Telegram. Please try again.',
    );
  }

  if (response.status === 401 || response.status === 404) {
    throw new Error('Telegram rejected this bot token. Check it in BotFather.');
  }

  if (!response.ok) {
    if (method === 'getFile' && response.status === 400) {
      const failure = z
        .object({ description: z.string() })
        .safeParse(await response.json().catch(() => undefined));
      if (
        failure.success &&
        /file is too big/i.test(failure.data.description)
      ) {
        throw new TelegramFileTooLargeError();
      }
    }
    if (response.status === 403) {
      throw new Error(
        'Telegram denied access. Check that the bot is a member, has permission to send messages, and can post in this channel.',
      );
    }
    if (response.status === 429) {
      throw new Error(
        'Telegram rate limit reached. Wait before sending again.',
      );
    }
    throw new Error(
      `Telegram rejected the request (HTTP ${response.status}). Check the chat, topic, file limits and bot permissions.`,
    );
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(
      'Could not read the Telegram response. Check the chat before retrying a send.',
    );
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
    allowed_updates: [
      'message',
      'channel_post',
      'edited_message',
      'edited_channel_post',
      'poll',
      'message_reaction',
      'message_reaction_count',
    ],
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
  messageThreadId = 0,
  replyToMessageId?: number,
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
    ...(replyToMessageId
      ? { reply_parameters: { message_id: replyToMessageId } }
      : {}),
    ...(messageThreadId ? { message_thread_id: messageThreadId } : {}),
  });

  const parsed = telegramSendMessageResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram delivery could not be confirmed from its response. Check the chat before trying again.',
    );
  }

  return parsed.data.result;
};

export type TelegramSendMediaType =
  | 'photo'
  | 'document'
  | 'video'
  | 'audio'
  | 'voice'
  | 'animation';
const TELEGRAM_MEDIA_METHODS = {
  photo: 'sendPhoto',
  document: 'sendDocument',
  video: 'sendVideo',
  audio: 'sendAudio',
  voice: 'sendVoice',
  animation: 'sendAnimation',
} as const;

export const sendTelegramAttachment = async ({
  token,
  chatId,
  messageThreadId,
  caption,
  bytes,
  name,
  type,
  asPhoto,
  mediaType,
  replyToMessageId,
}: {
  token: string;
  chatId: string;
  messageThreadId: number;
  caption: string;
  bytes: Buffer;
  name: string;
  type: string;
  asPhoto: boolean;
  mediaType?: TelegramSendMediaType;
  replyToMessageId?: number;
}): Promise<TelegramMessage> => {
  if (!/^-?[1-9]\d*$/.test(chatId) || !Number.isSafeInteger(Number(chatId))) {
    throw new Error('A valid Telegram chat ID is required.');
  }
  if (Array.from(caption).length > 1024)
    throw new Error(
      'Telegram attachment captions must be at most 1024 characters.',
    );
  const field = mediaType ?? (asPhoto ? 'photo' : 'document');
  const form = new FormData();
  form.set('chat_id', chatId);
  if (replyToMessageId)
    form.set(
      'reply_parameters',
      JSON.stringify({ message_id: replyToMessageId }),
    );
  if (messageThreadId) form.set('message_thread_id', String(messageThreadId));
  if (caption) form.set('caption', caption);
  form.set(field, new Blob([new Uint8Array(bytes)], { type }), name);
  const body = await getTelegramResponse(
    token,
    TELEGRAM_MEDIA_METHODS[field],
    form,
  );
  const parsed = telegramSendMessageResponseSchema.safeParse(body);
  if (!parsed.success)
    throw new Error(
      'Telegram delivery could not be confirmed from its response. Check the chat before trying again.',
    );
  return parsed.data.result;
};

export const deleteTelegramWebhook = async (
  token: string,
  dropPendingUpdates = false,
): Promise<boolean> => {
  const body = await getTelegramResponse(token, 'deleteWebhook', {
    drop_pending_updates: dropPendingUpdates,
  });
  if (!telegramSetWebhookResponseSchema.safeParse(body).success) {
    throw new Error('Telegram did not confirm disconnecting the webhook.');
  }
  return true;
};

const telegramFileSchema = z.object({
  file_id: z.string().min(1),
  file_unique_id: z.string().min(1),
  file_size: z.number().int().nonnegative().safe().optional(),
  file_path: z.string().min(1),
});

const telegramGetFileResponseSchema = z.object({
  ok: z.literal(true),
  result: telegramFileSchema,
});

export type TelegramFile = z.infer<typeof telegramFileSchema>;

export const getTelegramFile = async (
  token: string,
  fileId: string,
): Promise<TelegramFile> => {
  if (!fileId.trim()) {
    throw new Error('A Telegram file ID is required.');
  }

  const body = await getTelegramResponse(token, 'getFile', {
    file_id: fileId,
  });

  const parsed = telegramGetFileResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid file response.',
    );
  }

  return parsed.data.result;
};

export const sendTelegramMediaGroup = async ({
  token,
  chatId,
  messageThreadId,
  caption,
  files,
  replyToMessageId,
}: {
  token: string;
  chatId: string;
  messageThreadId: number;
  caption: string;
  files: {
    bytes: Buffer;
    name: string;
    type: string;
    asPhoto: boolean;
    mediaType?: TelegramSendMediaType;
  }[];
  replyToMessageId?: number;
}): Promise<TelegramMessage[]> => {
  if (files.length < 2 || files.length > 10)
    throw new Error('A Telegram album requires 2–10 files.');
  const form = new FormData();
  form.set('chat_id', chatId);
  if (messageThreadId) form.set('message_thread_id', String(messageThreadId));
  if (replyToMessageId)
    form.set(
      'reply_parameters',
      JSON.stringify({ message_id: replyToMessageId }),
    );
  const media = files.map((file, index) => {
    form.set(
      `file${index}`,
      new Blob([new Uint8Array(file.bytes)], { type: file.type }),
      file.name,
    );
    return {
      type: file.mediaType ?? (file.asPhoto ? 'photo' : 'document'),
      media: `attach://file${index}`,
      ...(index === 0 && caption ? { caption } : {}),
    };
  });
  form.set('media', JSON.stringify(media));
  const body = await getTelegramResponse(token, 'sendMediaGroup', form);
  const parsed = z
    .object({
      ok: z.literal(true),
      result: z.array(telegramMessageSchema).length(files.length),
    })
    .safeParse(body);
  if (!parsed.success)
    throw new Error(
      'Telegram album delivery could not be confirmed. Check the chat before trying again.',
    );
  return parsed.data.result;
};

export const telegramPollDraftSchema = z.object({
  question: z.string().trim().min(1).max(300),
  options: z
    .array(z.string().trim().min(1).max(100))
    .min(2)
    .max(10)
    .refine(
      (options) => new Set(options).size === options.length,
      'Poll answers must be distinct',
    ),
  duration: z.number().int().min(1).max(168),
  allowMultiselect: z.boolean(),
});

export const sendTelegramPoll = async ({
  token,
  chatId,
  messageThreadId,
  poll,
  replyToMessageId,
}: {
  token: string;
  chatId: string;
  messageThreadId: number;
  poll: z.infer<typeof telegramPollDraftSchema>;
  replyToMessageId?: number;
}): Promise<TelegramMessage> => {
  const draft = telegramPollDraftSchema.parse(poll);
  const body = await getTelegramResponse(token, 'sendPoll', {
    chat_id: chatId,
    ...(messageThreadId ? { message_thread_id: messageThreadId } : {}),
    ...(replyToMessageId
      ? { reply_parameters: { message_id: replyToMessageId } }
      : {}),
    question: draft.question,
    options: draft.options.map((text) => ({ text })),
    is_anonymous: true,
    type: 'regular',
    allows_multiple_answers: draft.allowMultiselect,
    // Bot API sendPoll accepts 5–2,628,000 seconds; the inbox uses hours.
    open_period: draft.duration * 3600,
  });
  const parsed = telegramSendMessageResponseSchema.safeParse(body);
  if (!parsed.success || !parsed.data.result.poll)
    throw new Error(
      'Telegram poll delivery could not be confirmed. Check the chat before trying again.',
    );
  return parsed.data.result;
};
