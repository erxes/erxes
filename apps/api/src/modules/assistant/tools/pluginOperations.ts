import { withOrg } from '@erxes/core-db';
import { StandardBracketNotationSerializer } from '@orpc/openapi-client/standard';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { type OutboundAnswer, requestOutbound } from '~/lib/outbound';
import { logger } from '~/logger';
import { pluginSession } from '~/modules/plugins/installations.service';
import type { PluginProcedure } from './pluginDocument';
import { bounded, describeError, refusal } from './results';

const PLUGIN_TIMEOUT_MS = 30_000;

const PLUGIN_MAX_BYTES = 1_000_000;

const log = logger.child({ component: 'assistant' });

const serializer = new StandardBracketNotationSerializer();

const Failure = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: z.object({ issues: z.array(z.unknown()) }).optional(),
});

const isPathValue = (value: unknown): value is string | number =>
  (typeof value === 'string' && value !== '' && value !== '.' && value !== '..') ||
  typeof value === 'number';

const requestFor = (entry: PluginProcedure, input: Record<string, unknown>) => {
  const missing = entry.pathNames.filter((name) => !isPathValue(input[name]));

  if (missing.length > 0) {
    return refusal('INVALID_INPUT', `${entry.name} needs ${missing.join(', ')} in its input`);
  }

  const path = entry.pathNames.reduce(
    (filled, name) => filled.replace(`{${name}}`, encodeURIComponent(String(input[name]))),
    entry.path,
  );

  const rest = Object.entries(input).filter(([name]) => !entry.pathNames.includes(name));

  const inQuery = ([name]: [string, unknown]) =>
    !entry.sendsBody || entry.queryNames.includes(name);

  const query = new URLSearchParams(
    serializer
      .serialize(Object.fromEntries(rest.filter(inQuery)))
      .map(([name, value]) => [name, String(value)]),
  ).toString();

  return {
    ok: true as const,
    url: `${entry.url}${path}${query ? `?${query}` : ''}`,
    body: entry.sendsBody
      ? JSON.stringify(Object.fromEntries(rest.filter((item) => !inQuery(item))))
      : '',
  };
};

const jsonOf = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text === '' ? null : text;
  }
};

const resultOf = (entry: PluginProcedure, answer: OutboundAnswer) => {
  const json = jsonOf(answer.body.toString());

  if (answer.status >= 200 && answer.status < 300) return bounded(json);

  const failure = Failure.safeParse(json).data;

  return refusal(
    failure?.code ?? 'ERROR',
    failure?.message ?? `The ${entry.plugin} plugin answered ${answer.status}`,
    { status: answer.status, ...(failure?.data ? { issues: failure.data.issues } : {}) },
  );
};

export const callPluginProcedure = async (
  orgId: string,
  entry: PluginProcedure,
  input: Record<string, unknown>,
) => {
  const request = requestFor(entry, input);

  if (!request.ok) return request;

  try {
    const session = await withOrg(orgId, () => pluginSession(entry.plugin));

    const answer = await requestOutbound(request.url, {
      method: entry.method,
      body: request.body,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${session.token}`,
        ...(entry.sendsBody ? { 'content-type': 'application/json' } : {}),
      },
      timeoutMs: PLUGIN_TIMEOUT_MS,
      maxBytes: PLUGIN_MAX_BYTES,
      overflow: 'fail',
    });

    return resultOf(entry, answer);
  } catch (error) {
    if (error instanceof ORPCError) return describeError(error);

    log.warn({ err: error, plugin: entry.plugin, procedure: entry.name }, 'plugin call failed');

    return refusal('PLUGIN_UNAVAILABLE', `The ${entry.plugin} plugin did not answer`);
  }
};
