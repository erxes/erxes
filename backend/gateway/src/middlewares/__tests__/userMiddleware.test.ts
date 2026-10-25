import { IncomingHttpHeaders } from 'http';
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
}));

jest.mock('~/connectionResolver', () => ({ generateModels: jest.fn() }));

jest.mock('node-fetch', () => jest.fn());

import {
  encodeAgentToolsAuthHeader,
  getTRPCContextHeaders,
  redis,
  trpcContextHeaderName,
  trpcContextSignatureHeaderName,
} from 'erxes-api-shared/utils';
import fetch from 'node-fetch';
import { generateModels } from '~/connectionResolver';
import userMiddleware from '~/middlewares/userMiddleware';

const SECRET = 'gateway-test-secret';

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64');

const decode = (value: unknown) =>
  JSON.parse(Buffer.from(String(value), 'base64').toString('utf8'));

const SPOOFED: IncomingHttpHeaders = {
  user: encode({ _id: 'spoofed-user' }),
  userid: 'spoofed-user',
  cpuser: encode({ _id: 'spoofed-cp' }),
  clientportal: encode({ _id: 'spoofed-portal' }),
  'erxes-subdomain': 'other-tenant',
  'x-erxes-identity-signature': 'v1.0.invalid',
};

const IDENTITY_HEADERS = Object.keys(SPOOFED);

// External routes that reach a service through the gateway's proxies.
const INGRESS_PATHS = [
  '/graphql',
  '/pl:core/agents/chat',
  '/pl:sales/pos/orders',
  '/pl:frontline/facebook/accounts',
  '/read-file',
  '/upload-file',
  '/delete-file',
];

const staff = {
  _id: 'staff-1',
  email: 'staff@example.com',
  isOwner: false,
};

const lean = (value: unknown) => ({ lean: async () => value });

const models = {
  Users: { findOne: jest.fn(() => lean(staff)) },
  Apps: {
    findOne: jest.fn(async () => ({
      _id: 'app-1',
      name: 'Integration',
      allowAllPermission: false,
    })),
    updateOne: jest.fn(async () => undefined),
  },
  ClientPortals: {
    findOne: jest.fn(async () => ({ _id: 'portal-1', name: 'Portal' })),
  },
  CPUsers: { findOne: jest.fn(async () => ({ _id: 'cp-1' })) },
};

type TestRequest = {
  headers: IncomingHttpHeaders;
  cookies: Record<string, string>;
  path: string;
  originalUrl: string;
  method: string;
  hostname: string;
  user?: { _id: string };
};

const makeRequest = (
  path: string,
  headers: IncomingHttpHeaders = {},
): TestRequest => ({
  headers: { host: 'tenant.example.com', ...SPOOFED, ...headers },
  cookies: {},
  path,
  originalUrl: path,
  method: 'POST',
  hostname: 'tenant.example.com',
});

const run = async (req: TestRequest) => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await userMiddleware(req as never, res as never, next);

  return { res, next };
};

const expectNoSpoofedIdentity = (headers: IncomingHttpHeaders) => {
  expect(headers['erxes-subdomain']).toBeUndefined();
  expect(headers['x-erxes-identity-signature']).toBeUndefined();

  for (const name of ['user', 'cpuser', 'clientportal']) {
    if (headers[name] !== undefined) {
      expect(decode(headers[name])._id).not.toMatch(/spoofed/);
    }
  }

  expect(headers.userid).not.toBe('spoofed-user');
};

describe('gateway userMiddleware identity headers', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_TOKEN_SECRET = SECRET;
    delete process.env.VERSION;
    delete process.env.INTERNAL_HEADER_SIGNATURE;
    (generateModels as jest.Mock).mockResolvedValue(models);
    (redis.get as jest.Mock).mockResolvedValue('1');
  });

  afterAll(() => {
    process.env = env;
  });

  it.each(INGRESS_PATHS)(
    'strips spoofed identity headers from an anonymous request to %s',
    async (path) => {
      const req = makeRequest(path);
      const { next } = await run(req);

      expect(next).toHaveBeenCalled();
      for (const name of IDENTITY_HEADERS) {
        expect(req.headers[name]).toBeUndefined();
      }
    },
  );

  it.each(INGRESS_PATHS)(
    'replaces spoofed identity with the session user on %s',
    async (path) => {
      const token = jwt.sign({ user: { _id: 'staff-1' } }, SECRET);
      const req = makeRequest(path, { authorization: `Bearer ${token}` });
      const { next } = await run(req);

      expect(next).toHaveBeenCalled();
      expect(decode(req.headers.user)).toMatchObject(staff);
      expect(req.headers.userid).toBe('staff-1');
      expect(req.headers.cpuser).toBeUndefined();
      expect(req.headers.clientportal).toBeUndefined();
      expectNoSpoofedIdentity(req.headers);
    },
  );

  it('strips spoofed identity when the session token is invalid', async () => {
    const token = jwt.sign({ user: { _id: 'staff-1' } }, 'wrong-secret');
    const req = makeRequest('/graphql', { authorization: `Bearer ${token}` });
    await run(req);

    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  it('strips spoofed identity when the session was revoked', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    const token = jwt.sign({ user: { _id: 'staff-1' } }, SECRET);
    const req = makeRequest('/graphql', { authorization: `Bearer ${token}` });
    await run(req);

    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  it('forwards only the verified client portal and its user', async () => {
    const req = makeRequest('/graphql', {
      'x-app-token': jwt.sign({ clientPortalId: 'portal-1' }, SECRET),
      'client-auth-token': jwt.sign({ userId: 'cp-1' }, SECRET),
    });
    await run(req);

    expect(decode(req.headers.clientportal)._id).toBe('portal-1');
    expect(decode(req.headers.cpuser)._id).toBe('cp-1');
    expect(req.headers.user).toBeUndefined();
    expectNoSpoofedIdentity(req.headers);
  });

  it('strips spoofed client portal identity when its token is invalid', async () => {
    const req = makeRequest('/graphql', {
      'x-app-token': jwt.sign({ clientPortalId: 'portal-1' }, 'wrong'),
    });
    await run(req);

    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  it('forwards an app token as its own principal', async () => {
    const req = makeRequest('/graphql', { 'erxes-app-token': 'app-token' });
    await run(req);

    expect(decode(req.headers.user)).toMatchObject({
      _id: 'app:app-1',
      isOwner: false,
    });
    expectNoSpoofedIdentity(req.headers);
  });

  it('forwards a signed agent call as the signed user', async () => {
    const req = makeRequest('/graphql', {
      'nginx-hostname': 'tenant',
      'x-erxes-agent-auth': encodeAgentToolsAuthHeader('tenant', 'staff-1'),
    });
    const { next } = await run(req);

    expect(next).toHaveBeenCalled();
    expect(decode(req.headers.user)).toMatchObject(staff);
    expect(req.headers['x-erxes-agent-auth']).toBeUndefined();
    expectNoSpoofedIdentity(req.headers);
  });

  it('rejects an agent auth header with a bad signature', async () => {
    const req = makeRequest('/graphql', {
      'x-erxes-agent-auth': `${encode({
        subdomain: 'tenant',
        userId: 'staff-1',
        at: Date.now(),
      })}.invalid`,
    });
    const { res, next } = await run(req);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  it('strips spoofed identity on the website-token path', async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({
      text: async () => 'ok',
    });
    const req = makeRequest('/graphql', {
      'erxes-core-token': 'token',
      'erxes-core-website-url': 'https://example.com',
    });
    await run(req);

    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  it('strips spoofed identity even when the request is rejected', async () => {
    const req = makeRequest('/graphql', {
      authorization: ['Bearer a', 'Bearer b'] as unknown as string,
    });
    await run(req);

    for (const name of IDENTITY_HEADERS) {
      expect(req.headers[name]).toBeUndefined();
    }
  });

  describe('tRPC context header', () => {
    it('is always dropped outside SaaS, even when signed', async () => {
      const req = makeRequest(
        '/pl:core/trpc/users.find',
        getTRPCContextHeaders('tenant', 'query', {}),
      );
      await run(req);

      expect(req.headers[trpcContextHeaderName]).toBeUndefined();
      expect(req.headers[trpcContextSignatureHeaderName]).toBeUndefined();
    });

    it('is dropped on SaaS when unsigned and signatures are enforced', async () => {
      process.env.VERSION = 'saas';
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
      const req = makeRequest('/pl:core/trpc/users.find', {
        [trpcContextHeaderName]: encode({ subdomain: 'other-tenant' }),
      });
      await run(req);

      expect(req.headers[trpcContextHeaderName]).toBeUndefined();
    });

    it('passes on SaaS when signed by a service', async () => {
      process.env.VERSION = 'saas';
      process.env.INTERNAL_HEADER_SIGNATURE = 'enforce';
      const headers = getTRPCContextHeaders('tenant', 'query', {});
      const req = makeRequest('/pl:core/trpc/users.find', headers);
      await run(req);

      expect(req.headers[trpcContextHeaderName]).toBe(
        headers[trpcContextHeaderName],
      );
    });
  });
});
