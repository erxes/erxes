import type { IntegrationProgramRun } from '@erxes/core-contract';
import {
  INTEGRATION_REQUEST_METHODS,
  INTEGRATION_SIGNATURE_ENCODINGS,
} from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { hmacSha256Bytes, safeEqual } from '~/lib/crypto';
import { OutboundError, requestOutbound } from '~/lib/outbound';
import { runProgram } from '~/modules/assistant/codeMode';
import { workerGate } from '~/modules/assistant/workers';
import { parseBody } from '~/modules/automations/actions/context';
import { sealedValuesOf } from './integrations.service';
import type { LoadedProgram } from './programs.service';

const REQUEST_TIMEOUT_MS = 8000;

const ANSWER_MAX_BYTES = 512 * 1024;

const RUNS_AT_ONCE = 4;

const RUNS_WAITING = 16;

const PLACEHOLDER = /\{\{\s*secret\.([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;

const RequestOptions = z.object({
  method: z.string().toUpperCase().pipe(z.enum(INTEGRATION_REQUEST_METHODS)).default('GET'),
  url: z.string().min(1).max(4000),
  headers: z.record(z.string(), z.string()).default({}),
  query: z.record(z.string(), z.coerce.string()).default({}),
  body: z.unknown().optional(),
});

const VerifyOptions = z.object({
  signature: z.string().max(1000),
  payload: z.string(),
  name: z.string(),
  encoding: z.enum(INTEGRATION_SIGNATURE_ENCODINGS).default('hex'),
});

const EqualsOptions = z.object({ value: z.string().max(4000), name: z.string() });

class DoorError extends Error {}

type Integration = LoadedProgram['integration'];

const gate = workerGate(RUNS_AT_ONCE, RUNS_WAITING);

const sealedOf = (integration: Integration) => {
  const sealed = sealedValuesOf(integration);

  const valueOf = (name: string) => {
    const value = Object.hasOwn(sealed, name) ? sealed[name] : undefined;

    if (value === undefined) throw new DoorError(`${integration.name} has no sealed value ${name}`);

    return value;
  };

  return {
    valueOf,
    filled: (text: string, inJson = false) =>
      text.replaceAll(PLACEHOLDER, (_match, name: string) =>
        inJson ? JSON.stringify(valueOf(name)).slice(1, -1) : valueOf(name),
      ),
    hidden: (text: string) =>
      Object.values(sealed).reduce(
        (kept, value) => (value.length >= 4 ? kept.replaceAll(value, '[sealed]') : kept),
        text,
      ),
  };
};

type Sealed = ReturnType<typeof sealedOf>;

const addressOf = (
  integration: Integration,
  sealed: Sealed,
  raw: string,
  query: Record<string, string>,
) => {
  const [first = ''] = integration.hosts;
  const url = new URL(sealed.filled(raw.startsWith('/') ? `https://${first}${raw}` : raw));

  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, sealed.filled(value));

  if (!integration.hosts.includes(url.host)) {
    throw new DoorError(
      `${url.host} is not one of ${integration.name}'s hosts (${integration.hosts.join(', ')})`,
    );
  }

  return url;
};

const request = async (
  integration: Integration,
  sealed: Sealed,
  options: z.output<typeof RequestOptions>,
) => {
  const url = addressOf(integration, sealed, options.url, options.query);
  const sendsJson = options.body !== undefined && typeof options.body !== 'string';

  const answer = await requestOutbound(url.href, {
    method: options.method,
    body: sendsJson
      ? sealed.filled(JSON.stringify(options.body), true)
      : sealed.filled(typeof options.body === 'string' ? options.body : ''),
    headers: {
      ...(sendsJson ? { 'Content-Type': 'application/json' } : {}),
      'User-Agent': 'erxes-integrations/1',
      ...Object.fromEntries(
        Object.entries(options.headers).map(([key, value]) => [key, sealed.filled(value)]),
      ),
    },
    timeoutMs: REQUEST_TIMEOUT_MS,
    maxBytes: ANSWER_MAX_BYTES,
    overflow: 'fail',
  });

  const text = sealed.hidden(answer.body.toString('utf8'));

  return {
    status: answer.status,
    headers: Object.fromEntries(
      Object.entries(answer.headers).flatMap(([key, value]) =>
        typeof value === 'string' ? [[key, sealed.hidden(value)]] : [],
      ),
    ),
    body: (answer.headers['content-type'] ?? '').includes('json') ? parseBody(text) : text,
  };
};

const door =
  <S extends z.ZodType>(schema: S, open: (options: z.output<S>) => unknown) =>
  async ([json = '{}']: string[]) => {
    const parsed = schema.safeParse(JSON.parse(json));

    if (!parsed.success) return { ok: false as const, message: z.prettifyError(parsed.error) };

    try {
      return { ok: true as const, value: await open(parsed.data) };
    } catch (error) {
      if (error instanceof DoorError || error instanceof OutboundError) {
        return { ok: false as const, message: error.message };
      }

      if (error instanceof Error && 'code' in error) {
        return { ok: false as const, message: `The request failed: ${String(error.code)}` };
      }

      throw error;
    }
  };

const doors = ({ integration }: LoadedProgram) => {
  const sealed = sealedOf(integration);

  return {
    request: door(RequestOptions, (options) => request(integration, sealed, options)),
    verify: door(VerifyOptions, ({ signature, payload, name, encoding }) =>
      safeEqual(
        Buffer.from(signature.replace(/^sha256=/, ''), encoding),
        hmacSha256Bytes(sealed.valueOf(name), payload),
      ),
    ),
    equals: door(EqualsOptions, ({ value, name }) => safeEqual(value, sealed.valueOf(name))),
  };
};

const PRELUDE = `
const __door = async (name, options) => {
  const answer = JSON.parse(await globalThis['__host_' + name](JSON.stringify(options)));
  if (answer.ok === false) throw new Error(answer.message);
  return answer.value;
};
globalThis.request = (options) => __door('request', options ?? {});
globalThis.verify = (signature, payload, name, encoding) => __door('verify', { signature, payload, name, encoding });
globalThis.equals = (value, name) => __door('equals', { value, name });
`;

const preludeOf = (globals: Record<string, unknown>) =>
  `${PRELUDE}\n${Object.entries(globals)
    .map(
      ([name, value]) =>
        `globalThis.${name} = JSON.parse(${JSON.stringify(JSON.stringify(value ?? null))});`,
    )
    .join('\n')}`;

export const runIntegrationProgram = async (
  loaded: LoadedProgram,
  globals: Record<string, unknown>,
): Promise<IntegrationProgramRun> => {
  const outcome = await runProgram(
    { code: loaded.program.code, prelude: preludeOf(globals), host: doors(loaded) },
    gate,
  );

  if (!outcome.ok) return { ok: false, code: outcome.code, message: outcome.message };

  if (outcome.truncated) {
    return { ok: false, code: 'OUTPUT_TOO_LARGE', message: 'The program returned too much' };
  }

  return { ok: true, result: outcome.result, logs: outcome.logs ?? [] };
};
