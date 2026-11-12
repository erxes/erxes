import { requestInfo } from '~/http/requestContext';

/**
 * Structured logs: one JSON object per line in production (`LOG_FORMAT=json`,
 * the default there), readable lines in development. Every line inside a
 * request carries its `requestId`; anything that looks like a secret
 * (passwords, tokens, cookies, keys, hashes) is replaced before it is written.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const production = process.env.NODE_ENV === 'production';
const format = (process.env.LOG_FORMAT ?? (production ? 'json' : 'pretty')) as 'json' | 'pretty';
const threshold = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? LEVELS.info;

const SECRET =
  /pass(word)?|secret|token|authorization|cookie|api[-_]?key|private|hash|signature|credential/i;

const BEARER = /\b(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/g;
const URL_PASSWORD = /(\/\/[^:/\s]+:)[^@/\s]+@/g;

const scrubText = (value: string) =>
  value.replace(BEARER, '$1[redacted]').replace(URL_PASSWORD, '$1[redacted]@');

/** A copy of `value` with secret-looking fields replaced (depth-limited). */
export const redact = (value: unknown, depth = 0): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: scrubText(value.message),
      ...(production ? {} : { stack: value.stack ? scrubText(value.stack) : undefined }),
      ...(value.cause ? { cause: redact(value.cause, depth + 1) } : {}),
      ...('code' in value ? { code: (value as { code?: unknown }).code } : {}),
    };
  }

  if (typeof value === 'string') return scrubText(value);

  if (value === null || typeof value !== 'object' || depth > 5) return value;

  if (Array.isArray(value)) return value.slice(0, 50).map((item) => redact(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SECRET.test(key) ? '[redacted]' : redact(item, depth + 1),
    ]),
  );
};

const write = (level: Level, message: string, fields?: Record<string, unknown>) => {
  if (LEVELS[level] < threshold) return;

  const { requestId } = requestInfo();
  const data = fields ? (redact(fields) as Record<string, unknown>) : undefined;

  if (format === 'json') {
    const line = JSON.stringify({
      time: new Date().toISOString(),
      level,
      msg: scrubText(message),
      ...(requestId ? { requestId } : {}),
      ...data,
    });

    (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(`${line}\n`);

    return;
  }

  const extra = data && Object.keys(data).length ? ` ${JSON.stringify(data)}` : '';
  const text = `[core] ${scrubText(message)}${extra}${requestId ? ` (${requestId})` : ''}`;

  if (level === 'error') console.error(text);
  else if (level === 'warn') console.warn(text);
  else console.log(text);
};

export const log = {
  debug: (message: string, fields?: Record<string, unknown>) => write('debug', message, fields),
  info: (message: string, fields?: Record<string, unknown>) => write('info', message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => write('warn', message, fields),
  error: (message: string, fields?: Record<string, unknown>) => write('error', message, fields),
};
