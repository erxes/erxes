import cookieParser from 'cookie-parser';
import express from 'express';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
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

// Tenant databases are in-memory fixtures (see `mockModelsFor`).
jest.mock('~/connectionResolver', () => ({
  generateModels: async (subdomain: string) => mockModelsFor(subdomain),
}));

// The router is replaced by the echo server below.
jest.mock('~/apollo-router', () => ({
  get apolloRouterPort() {
    return Number(process.env.TEST_ROUTER_PORT);
  },
}));

// erxes.io's website check is the only outbound call stubbed; every other
// request (including the subscription refetch) is real HTTP.
jest.mock('node-fetch', () => {
  const actual = jest.requireActual('node-fetch');
  const stubbed = (url: string, init?: object) =>
    String(url) === 'https://erxes.io/check-website'
      ? Promise.resolve(new actual.Response('ok'))
      : actual(url, init);

  return Object.assign(stubbed, actual, { __esModule: true, default: stubbed });
});

import {
  encodeAgentToolsAuthHeader,
  extractUserFromHeader,
  getPlugin,
  getSubdomainFromHeaders,
  getTRPCContextHeaders,
  redis,
  verifyIdentityHeaders,
} from 'erxes-api-shared/utils';

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

const IDENTITY_HEADERS = Object.keys(SPOOFED);

// Every external route that lands on a service: the router, the plugin REST
// proxy (agents, POS and integration routes) and the core catch-all (files).
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
const otherStaff = { _id: 'staff-2', email: 'other@example.com' };

// A user id only exists in its own tenant.
const TENANT_USERS: Record<string, Record<string, object>> = {
  tenant: { 'staff-1': staff },
  other: { 'staff-2': otherStaff },
};

function mockModelsFor(subdomain: string) {
  const users = TENANT_USERS[subdomain] || {};

  return {
    Users: {
      findOne: ({ _id }: { _id: string }) => ({
        lean: async () => users[_id] || null,
      }),
    },
    Apps: {
      findOne: async ({ token }: { token: string }) =>
        token === 'app-token'
          ? { _id: 'app-1', name: 'Integration', allowAllPermission: false }
          : null,
      updateOne: async () => undefined,
    },
    ClientPortals: {
      findOne: async ({ _id }: { _id: string }) =>
        _id === 'portal-1' ? { _id: 'portal-1', name: 'Portal' } : null,
    },
    CPUsers: {
      findOne: async ({ _id }: { _id: string }) =>
        _id === 'cp-1' ? { _id: 'cp-1' } : null,
    },
  };
}

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

  // Headers the downstream service received for the one request just sent.
  const forwarded = () => {
    expect(received).toHaveLength(1);
    return received[0];
  };

  const expectNoIdentity = (headers: http.IncomingHttpHeaders) => {
    expect(headers.user).toBeUndefined();
    expect(headers.cpuser).toBeUndefined();
    expect(headers.clientportal).toBeUndefined();
    expect(headers['erxes-subdomain']).toBeUndefined();
    expect(headers['x-erxes-identity-signature']).toBeUndefined();
    expect(headers.userid).toBe('');
  };

  const sessionToken = (userId = 'staff-1') =>
    jwt.sign({ user: { _id: userId } }, SECRET);

  beforeAll(async () => {
    echo = http.createServer((req, res) => {
      received.push(req.headers);
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ data: { refetch: { name: 'Refetched' } } }));
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
    jest.mocked(getPlugin).mockResolvedValue({ address: echoUrl, config: {} });
    jest.mocked(redis.get).mockResolvedValue('1');
  });

  describe.each(INGRESS_PATHS)('%s', (path) => {
    it('forwards no identity for an anonymous request with spoofed headers', async () => {
      expect(await send(path)).toBe(200);
      expectNoIdentity(forwarded());
    });

    it('forwards only the signed session identity', async () => {
      expect(
        await send(path, { authorization: `Bearer ${sessionToken()}` }),
      ).toBe(200);

      const headers = forwarded();
      expect(decode(headers.user)).toMatchObject(staff);
      expect(headers.userid).toBe('staff-1');
      expect(headers.cpuser).toBeUndefined();
      expect(headers.clientportal).toBeUndefined();
      expect(headers['erxes-subdomain']).toBeUndefined();
      expect(verifyIdentityHeaders(headers)).toBe('valid');
    });
  });

  it('a service enforcing signatures accepts what the gateway forwards', async () => {
    await send('/graphql', { cookie: `auth-token=${sessionToken()}` });
    process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';

    expect(extractUserFromHeader(forwarded())).toMatchObject(staff);
  });

  it('forwards no identity when the session token is signed with another secret', async () => {
    await send('/graphql', {
      authorization: `Bearer ${jwt.sign({ user: { _id: 'staff-1' } }, 'x')}`,
    });
    expectNoIdentity(forwarded());
  });

  it('forwards no identity when the session was revoked', async () => {
    jest.mocked(redis.get).mockResolvedValue(null);
    await send('/graphql', { authorization: `Bearer ${sessionToken()}` });
    expectNoIdentity(forwarded());
  });

  it('forwards only the verified client portal and its user, signed', async () => {
    await send('/graphql', {
      'x-app-token': jwt.sign({ clientPortalId: 'portal-1' }, SECRET),
      'client-auth-token': jwt.sign({ userId: 'cp-1' }, SECRET),
    });

    const headers = forwarded();
    expect(decode(headers.clientportal)._id).toBe('portal-1');
    expect(decode(headers.cpuser)._id).toBe('cp-1');
    expect(headers.user).toBeUndefined();
    expect(verifyIdentityHeaders(headers)).toBe('valid');
  });

  it('forwards no client portal identity when its token is invalid', async () => {
    await send('/graphql', {
      'x-app-token': jwt.sign({ clientPortalId: 'portal-1' }, 'wrong'),
    });
    expectNoIdentity(forwarded());
  });

  it('forwards an app token as its own signed principal', async () => {
    await send('/graphql', { 'erxes-app-token': 'app-token' });

    const headers = forwarded();
    expect(decode(headers.user)).toEqual({
      _id: 'app:app-1',
      username: 'Integration',
      isOwner: false,
    });
    expect(verifyIdentityHeaders(headers)).toBe('valid');
  });

  it('forwards a signed agent call as the signed user, without the credential', async () => {
    await send('/graphql', {
      'nginx-hostname': 'tenant',
      'x-erxes-agent-auth': encodeAgentToolsAuthHeader('tenant', 'staff-1'),
    });

    const headers = forwarded();
    expect(decode(headers.user)).toMatchObject(staff);
    expect(headers['x-erxes-agent-auth']).toBeUndefined();
    expect(verifyIdentityHeaders(headers)).toBe('valid');
  });

  it('rejects an agent auth header with a bad signature before any service', async () => {
    const status = await send('/graphql', {
      'x-erxes-agent-auth': `${encode({
        subdomain: 'tenant',
        userId: 'staff-1',
        at: Date.now(),
      })}.invalid`,
    });

    expect(status).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('forwards no spoofed identity on the website-token path', async () => {
    await send('/graphql', {
      'erxes-core-token': 'token',
      'erxes-core-website-url': 'https://example.com',
    });

    const headers = forwarded();
    expect(headers.user).toBeUndefined();
    expect(headers.cpuser).toBeUndefined();
    expect(headers.clientportal).toBeUndefined();
    expect(headers.userid).toBe('userId');
  });

  it('authenticates and forwards against the same tenant', async () => {
    // staff-2 only exists in "other"; the request picks it by hostname.
    await send('/graphql', {
      authorization: `Bearer ${sessionToken('staff-2')}`,
      hostname: 'other.example.com',
    });

    const headers = forwarded();
    expect(decode(headers.user)).toMatchObject(otherStaff);
    expect(getSubdomainFromHeaders(headers)).toBe('other');
    expect(verifyIdentityHeaders(headers)).toBe('valid');
  });

  describe('tRPC context header', () => {
    it.each([
      '/pl:core/trpc/users.find',
      '/trpc/users.find',
      '/pl:sales/segments',
    ])('is dropped outside SaaS on %s, even when signed', async (path) => {
      await send(path, getTRPCContextHeaders('other-tenant', 'mutation', {}));

      const headers = forwarded();
      expect(headers['x-trpc-context']).toBeUndefined();
      expect(headers['x-trpc-context-signature']).toBeUndefined();
    });

    it('is dropped on SaaS when unsigned and signatures are enforced', async () => {
      process.env.VERSION = 'saas';
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
      await send('/pl:core/trpc/users.find', {
        'x-trpc-context': encode({ subdomain: 'other-tenant' }),
      });

      expect(forwarded()['x-trpc-context']).toBeUndefined();
    });

    it('reaches the service on SaaS when signed by a service', async () => {
      process.env.VERSION = 'saas';
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
      const headers = getTRPCContextHeaders('tenant', 'query', {});
      await send('/pl:core/trpc/users.find', headers);

      expect(forwarded()['x-trpc-context']).toBe(headers['x-trpc-context']);
    });
  });

  it('a subscription refetch through the router carries only the cookie', async () => {
    const { default: SubscriptionResolver } = await import(
      '~/subscription/SubscriptionResolver'
    );

    // Same shape as a plugin subscription resolver filling in fields the
    // published payload lacks.
    const schema = makeExecutableSchema({
      typeDefs: `
        type Item { _id: String, name: String }
        type Query { itemChanged: Item }
      `,
      resolvers: {
        Query: {
          itemChanged: (_root, _args, context, info) =>
            context.dataSource.queryAndMergeMissingData({
              payload: { itemChanged: { _id: 'item-1' } },
              queryVariables: {},
              info,
              buildQueryUsingSelections: (selections: string) =>
                `query refetch { refetch { ${selections} } }`,
            }),
        },
      },
    });

    const result = await graphql({
      schema,
      source: '{ itemChanged { _id name } }',
      contextValue: {
        dataSource: new SubscriptionResolver(echoUrl, {
          extra: {
            request: { headers: { cookie: 'auth-token=abc', ...SPOOFED } },
          },
        }),
      },
    });

    expect(result.data).toEqual({
      itemChanged: { _id: 'item-1', name: 'Refetched' },
    });

    const headers = forwarded();
    expect(headers.cookie).toBe('auth-token=abc');
    for (const name of IDENTITY_HEADERS) {
      expect(headers[name]).toBeUndefined();
    }
  });
});
