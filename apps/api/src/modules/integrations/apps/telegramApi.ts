import { z } from 'zod';
import {
  GatewayError,
  gatewayHttp,
  json,
  parse,
  secret,
  Text,
} from '@erxes/plugin-sdk/integrations';

export const keys = z.object({
  botToken: secret(
    'Bot token',
    z
      .string()
      .trim()
      .regex(/^\d+:[\w-]+$/, 'the token BotFather gave, like 123456:ABC-DEF'),
  ),
});

export type TelegramKeys = z.output<typeof keys>;

const Failure = z.object({ ok: z.literal(false), description: z.string() });

export const Bot = z.object({ id: Text });

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

export const call = async <T>(
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

export const tokenGone = (error: unknown) =>
  error instanceof GatewayError && (error.status === 401 || error.status === 404);
