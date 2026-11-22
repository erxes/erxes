import { z } from 'zod';
import {
  type AppClient,
  type ClientOptions,
  GatewayError,
  gatewayHttp,
  json,
  parse,
  Text,
} from '@erxes/plugin-sdk/integrations';

const NAME = 'Facebook';

export const GRAPH_VERSION = 'v23.0';

const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

const TOKEN_REFUSED = 190;

const Failure = z.object({
  error: z.object({ message: z.string(), code: z.number().optional() }),
});

const refusal = (status: number, body: unknown) => {
  const failure = Failure.safeParse(body);

  if (!failure.success) return `Facebook answered ${status}`;

  return failure.data.error.code === TOKEN_REFUSED
    ? 'Facebook turned down the sign-in: connect Facebook again'
    : `Facebook: ${failure.data.error.message}`;
};

const graphFetch =
  (options: ClientOptions) => async (input: string | URL | Request, init?: RequestInit) => {
    const response = await (options.fetch ?? globalThis.fetch)(input, init);

    if (response.ok) return response;

    throw new GatewayError(
      refusal(response.status, await response.json().catch(() => null)),
      response.status,
    );
  };

interface Call {
  token?: string;
  method?: 'GET' | 'POST' | 'DELETE';
  body?: Record<string, unknown>;
  form?: Record<string, string>;
}

export const graph = async <T>(
  path: string,
  schema: z.ZodType<T>,
  call: Call = {},
  options: ClientOptions = {},
) => {
  const headers = new Headers(call.token ? { Authorization: `Bearer ${call.token}` } : {});

  if (call.form) headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const text = await gatewayHttp(NAME, GRAPH, { fetch: graphFetch(options) })(path, {
    method: call.method ?? 'GET',
    headers,
    body: call.form
      ? new URLSearchParams(call.form).toString()
      : call.body
        ? json(call.body)
        : undefined,
  });

  return parse(NAME, schema, text, `an unreadable ${path.split('?')[0]} answer`);
};

export const Done = z.object({ success: z.literal(true) });

const Person = z.object({ name: z.string().min(1) });

export const accountOf = async (accessToken: string, options: ClientOptions = {}) =>
  (await graph('/me?fields=name', Person, { token: accessToken }, options)).name;

const Lasting = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().positive().optional(),
});

export const longLivedToken = async (input: { accessToken: string } & AppClient) => {
  const lasting = await graph('/oauth/access_token', Lasting, {
    method: 'POST',
    form: {
      grant_type: 'fb_exchange_token',
      client_id: input.clientId,
      client_secret: input.clientSecret,
      fb_exchange_token: input.accessToken,
    },
  });

  return { accessToken: lasting.access_token, expiresIn: lasting.expires_in };
};

const Page = z.object({ id: Text, access_token: z.string().min(1).optional() });

export const pageToken = async (userToken: string, pageId: string) => {
  const page = await graph(`/${encodeURIComponent(pageId)}?fields=access_token`, Page, {
    token: userToken,
  });

  if (!page.access_token)
    throw new GatewayError(
      `The signed-in Facebook account can't manage page ${pageId}: connect Facebook as one of its admins`,
      403,
    );

  return page.access_token;
};

export const appToken = (client: AppClient) => `${client.clientId}|${client.clientSecret}`;
