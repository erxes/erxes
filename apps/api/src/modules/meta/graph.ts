import { z } from 'zod';
import { config } from '~/config';
import { requestOutbound } from '~/lib/outbound';

const MAX_BYTES = 1024 * 1024;

const TOKEN_REFUSED = 190;

const Failure = z.object({
  error: z.object({ message: z.string(), code: z.number().optional() }),
});

export class MetaRefused extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly tokenRefused: boolean,
  ) {
    super(message);
  }
}

export interface GraphRequest {
  method?: 'GET' | 'POST' | 'DELETE';
  query?: Record<string, string>;
  body?: unknown;
  form?: FormData;
}

const encode = async ({ body, form }: GraphRequest) => {
  if (form) {
    const request = new Request('http://form.local', { method: 'POST', body: form });

    return {
      payload: Buffer.from(await request.arrayBuffer()),
      contentType: request.headers.get('content-type'),
    };
  }

  return body === undefined
    ? { payload: '', contentType: null }
    : { payload: JSON.stringify(body), contentType: 'application/json' };
};

const parsed = (text: string): unknown => {
  try {
    return text ? z.json().parse(JSON.parse(text)) : null;
  } catch {
    return text;
  }
};

export const graphCall = async (path: string, token: string | null, request: GraphRequest = {}) => {
  const url = new URL(`${config.meta.graphUrl}/${path.replace(/^\/+/, '')}`);

  for (const [key, value] of Object.entries(request.query ?? {})) url.searchParams.set(key, value);

  const { payload, contentType } = await encode(request);

  const answer = await requestOutbound(url.toString(), {
    method: request.method ?? 'GET',
    body: payload,
    headers: {
      accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(contentType ? { 'content-type': contentType } : {}),
    },
    timeoutMs: 15_000,
    maxBytes: MAX_BYTES,
    overflow: 'fail',
  });

  return { status: answer.status, body: parsed(answer.body.toString('utf8')) };
};

export const graph = async (path: string, token: string | null, request: GraphRequest = {}) => {
  const { status, body } = await graphCall(path, token, request);

  if (status >= 200 && status < 300) return body;

  const failure = Failure.safeParse(body).data?.error;

  throw new MetaRefused(
    failure?.message ?? `Meta answered ${status}`,
    status,
    failure?.code === TOKEN_REFUSED,
  );
};
