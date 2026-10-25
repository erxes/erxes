import cookieParser from 'cookie-parser';
import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as jwt from 'jsonwebtoken';

jest.mock('erxes-api-shared/utils/redis', () => ({
  redis: { get: jest.fn(), set: jest.fn() },
}));

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/headers'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools'),
  ...jest.requireActual('erxes-api-shared/utils/trpc/context-header'),
  getSubdomain: jest.requireActual('erxes-api-shared/utils/utils').getSubdomain,
  redis: jest.requireMock('erxes-api-shared/utils/redis').redis,
  getPlugin: jest.fn(),
}));

jest.mock('~/connectionResolver', () => ({ generateModels: jest.fn() }));

// The router is replaced by the echo server below.
jest.mock('~/apollo-router', () => ({
  get apolloRouterPort() {
    return Number(process.env.TEST_ROUTER_PORT);
  },
}));

import {
  extractUserFromHeader,
  getPlugin,
  getSubdomainFromHeaders,
  getTRPCContextHeaders,
  redis,
  verifyIdentityHeaders,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolver';

const SECRET = 'gateway-ingress-secret';

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

const decode = (value: unknown) =>
  JSON.parse(Buffer.from(String(value), 'base64').toString('utf8'));

const SPOOFED = {
  user: encode({ _id: 'spoofed-user' }),
  userid: 'spoofed-user',
  cpuser: encode({ _id: 'spoofed-cp' }),
  clientportal: encode({ _id: 'spoofed-portal' }),
  'erxes-subdomain': 'other-tenant',
  'x-erxes-identity-signature': 'v1.0.invalid',
};

// Every external route that lands on a service: the router, the plugin REST
// proxy (agents, file and integration routes) and the core catch-all.
const INGRESS_PATHS = [
  '/graphql',
  '/pl:core/agents/chat',
  '/pl:sales/pos/orders',
  '/pl:frontline/facebook/accounts',
  '/read-file?key=a.png',
  '/upload-file',
  '/delete-file',
];

const staff = { _id: 'staff-1', email: 'staff@example.com', isOwner: false };

const listen = (server: http.Server) =>
  new Promise<number>((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve((server.address() as AddressInfo).port),
    ),
  );

describe('gateway ingress', () => {
  const env = { ...process.env };
  const received: http.IncomingHttpHeaders[] = [];
  let echo: http.Server;
  let gateway: http.Server;
  let gatewayPort: number;
  let echoUrl: string;

  const send = (path: string, headers: Record<string, string> = {}) =>
    new Promise<number>((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: gatewayPort,
          path,
          method: 'POST',
          headers: {
            host: 'tenant.example.com',
            'content-type': 'application/json',
            ...SPOOFED,
            ...headers,
          },
        },
        (res) => {
          res.resume();
          res.on('end', () => resolve(res.statusCode || 0));
        },
      );
      req.on('error', reject);
      req.end('{}');
    });

  const lastReceived = () => received[received.length - 1];

  beforeAll(async () => {
    echo = http.createServer((req, res) => {
      received.push(req.headers);
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ data: { ok: true } }));
    });
    const echoPort = await listen(echo);
    echoUrl = `http://127.0.0.1:${echoPort}`;

    process.env.TEST_ROUTER_PORT = String(echoPort);
    // Production makes the core proxy use the target address instead of
    // localhost:3300.
    process.env.NODE_ENV = 'production';

    const { applyPluginProxy, applyProxiesCoreless, applyProxyToCore } =
      await import('~/proxy/middleware');
    const { default: userMiddleware } = await import(
      '~/middlewares/userMiddleware'
    );

    const app = express();
    app.use(cookieParser());
    app.use(userMiddleware);
    applyPluginProxy(app);
    applyProxiesCoreless(app);
    applyProxyToCore(app, [{ name: 'core', address: echoUrl, config: {} }]);

    gateway = http.createServer(app);
    gatewayPort = await listen(gateway);
  });

  afterAll(async () => {
    process.env = env;
    await new Promise((resolve) => gateway.close(resolve));
    await new Promise((resolve) => echo.close(resolve));
  });

  beforeEach(() => {
    received.length = 0;
    process.env.JWT_TOKEN_SECRET = SECRET;
    delete process.env.VERSION;
    delete process.env.INTERNAL_HEADER_SIGNATURE;
    (getPlugin as jest.Mock).mockResolvedValue({ address: echoUrl });
    (redis.get as jest.Mock).mockResolvedValue('1');
    (generateModels as jest.Mock).mockResolvedValue({
      Users: { findOne: jest.fn(() => ({ lean: async () => staff })) },
    });
  });

  it.each(INGRESS_PATHS)(
    'forwards no identity for an anonymous request to %s',
    async (path) => {
      expect(await send(path)).toBe(200);

      const headers = lastReceived();
      expect(headers.user).toBeUndefined();
      expect(headers.cpuser).toBeUndefined();
      expect(headers.clientportal).toBeUndefined();
      expect(headers['erxes-subdomain']).toBeUndefined();
      expect(headers['x-erxes-identity-signature']).toBeUndefined();
      expect(headers.userid || '').toBe('');
    },
  );

  it.each(INGRESS_PATHS)(
    'forwards only the signed session identity to %s',
    async (path) => {
      const token = jwt.sign({ user: { _id: 'staff-1' } }, SECRET);

      expect(await send(path, { authorization: `Bearer ${token}` })).toBe(200);

      const headers = lastReceived();
      expect(decode(headers.user)).toMatchObject(staff);
      expect(headers.userid).toBe('staff-1');
      expect(headers.cpuser).toBeUndefined();
      expect(headers['erxes-subdomain']).toBeUndefined();
      expect(verifyIdentityHeaders(headers)).toBe('valid');

      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
      expect(extractUserFromHeader(headers)).toMatchObject(staff);
    },
  );

  it('binds the identity to the tenant the gateway authenticated', async () => {
    const token = jwt.sign({ user: { _id: 'staff-1' } }, SECRET);

    await send('/graphql', {
      authorization: `Bearer ${token}`,
      hostname: 'other.example.com',
    });

    const headers = lastReceived();
    expect(generateModels).toHaveBeenCalledWith('other');
    expect(getSubdomainFromHeaders(headers)).toBe('other');
    expect(verifyIdentityHeaders(headers)).toBe('valid');
  });

  it.each([
    '/pl:core/trpc/users.find',
    '/trpc/users.find',
    '/pl:sales/segments',
  ])('drops a client-supplied tRPC context on %s', async (path) => {
    await send(path, getTRPCContextHeaders('other-tenant', 'mutation', {}));

    const headers = lastReceived();
    expect(headers['x-trpc-context']).toBeUndefined();
    expect(headers['x-trpc-context-signature']).toBeUndefined();
  });

  it('sends only the cookie when a subscription refetches through the router', async () => {
    const { default: SubscriptionResolver } = await import(
      '~/subscription/SubscriptionResolver'
    );
    const { gql } = await import('@apollo/client/core');

    const resolver = new SubscriptionResolver(echoUrl, {
      extra: {
        request: { headers: { cookie: 'auth-token=abc', ...SPOOFED } },
      },
    });

    await (
      resolver as unknown as {
        query: (request: { query: unknown }) => Promise<unknown>;
      }
    ).query({
      query: gql`
        query subscriptionRefetch {
          ok
        }
      `,
    });

    const headers = lastReceived();
    expect(headers.cookie).toBe('auth-token=abc');
    for (const name of Object.keys(SPOOFED)) {
      expect(headers[name]).toBeUndefined();
    }
  });
});
