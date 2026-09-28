import { z } from 'zod';

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

export const getTelegramBot = async (token: string): Promise<TelegramBot> => {
  if (token !== token.trim() || !/^[0-9]+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error('Enter the bot token exactly as provided by BotFather.');
  }

  let response: Response;

  try {
    response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'GET',
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

  const parsed = telegramGetMeResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new Error(
      'Telegram returned an unsuccessful or invalid bot response.',
    );
  }

  return parsed.data.result;
};
