import { once } from 'node:events';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { z } from 'zod';
import { afterAll, beforeAll } from 'vite-plus/test';
import { config } from '~/config';
import { hmacSha256 } from '~/lib/crypto';

export const INSTALL_APP = { appId: '1234567', appSecret: 'install-app-secret-0123456789' };

export const INSTALL_VERIFY_TOKEN = 'install-verify-token';

export interface GraphCall {
  method: string;
  path: string;
  query: Record<string, string>;
  auth: string | null;
  body: unknown;
}

const Json = z.json();

const readBody = async (req: IncomingMessage) => {
  let raw = '';

  for await (const chunk of req) raw += String(chunk);

  if (!raw) return null;

  try {
    return Json.parse(JSON.parse(raw));
  } catch {
    return raw;
  }
};

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

export const signed = (secret: string, raw: string) => `sha256=${hmacSha256(secret, raw, 'hex')}`;

export const useFakeGraph = () => {
  const fake = {
    calls: [] as GraphCall[],
    pages: [] as unknown[],
    names: new Map<string, string>(),
    refuseTokens: false,
    relayDown: false,
    sent: 0,
  };

  const answer = (call: GraphCall): [number, unknown] => {
    if (call.path.startsWith('/relay/')) return fake.relayDown ? [503, {}] : [200, { ok: true }];

    if (fake.refuseTokens && call.auth)
      return [400, { error: { message: 'Error validating access token', code: 190 } }];

    if (call.path === 'oauth/access_token')
      return [
        200,
        { access_token: call.query.fb_exchange_token ? 'long-user-token' : 'user-token' },
      ];

    if (call.path === 'me/accounts') return [200, { data: fake.pages }];

    if (call.path === 'me') return [200, { id: 'me' }];

    if (call.path === 'me/messages') {
      fake.sent += 1;

      return [200, { message_id: `m_sent_${fake.sent}` }];
    }

    if (/\/(subscribed_apps|likes)$/.test(call.path)) return [200, { success: true }];

    if (/\/(comments|replies)$/.test(call.path)) return [200, { id: `reply_${fake.calls.length}` }];

    const name = fake.names.get(call.path);

    return name ? [200, { first_name: name }] : [404, { error: { message: 'Unknown path' } }];
  };

  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? '/', 'http://graph.local');

      const call = {
        method: req.method ?? 'GET',
        path: url.pathname.replace(/^\/v23\.0\//, ''),
        query: Object.fromEntries(url.searchParams),
        auth: req.headers.authorization ?? null,
        body: await readBody(req),
      };

      fake.calls.push(call);

      const [status, body] = answer(call);

      send(res, status, body);
    })();
  });

  beforeAll(async () => {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const address = server.address();
    const base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;

    Object.assign(config.meta, {
      graphUrl: `${base}/v23.0`,
      dialogUrl: `${base}/dialog/oauth`,
      app: INSTALL_APP,
      verifyToken: INSTALL_VERIFY_TOKEN,
      relay: {
        url: `${base}/relay`,
        key: 'relay-key',
        webhookUrl: 'https://core.test/core/v1/meta/webhook',
      },
    });
  });

  afterAll(() => server.close());

  return {
    fake,
    callsTo: (path: string, method = 'POST') =>
      fake.calls.filter((call) => call.path === path && call.method === method),
  };
};
