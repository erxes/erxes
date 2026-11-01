import { createHash, randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

// Each case is an attack on the staff session: every one must end with no user

const mockStore = new Map<string, string>();
const mockTtls = new Map<string, number>();

const mockRedis = {
  get: async (key: string) => mockStore.get(key) ?? null,
  del: async (key: string) => {
    mockStore.delete(key);
    return 1;
  },
  set: async (key: string, value: string, ...args: unknown[]) => {
    if (args.includes('XX') && !mockStore.has(key)) {
      return null;
    }
    mockStore.set(key, value);
    const exIndex = args.indexOf('EX');
    if (exIndex >= 0) {
      mockTtls.set(key, Number(args[exIndex + 1]));
    }
    return 'OK';
  },
};

interface IMockUser {
  _id: string;
  isActive?: boolean;
}

const mockUsers: Record<string, IMockUser[]> = {};

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/headers'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools/auth'),
  getSubdomain: (req: { hostname: string }) => req.hostname.split('.')[0],
  setClientPortalHeader: jest.fn(),
  setCPUserHeader: jest.fn(),
  get redis() {
    return mockRedis;
  },
}));

jest.mock('../../connectionResolver', () => ({
  generateModels: async (subdomain: string) => ({
    Users: {
      findOne: (query: { _id: string; isActive?: { $ne: boolean } }) => ({
        lean: async () =>
          (mockUsers[subdomain] || []).find(
            (user) =>
              user._id === query._id &&
              !(query.isActive && user.isActive === false),
          ) || null,
      }),
    },
    Apps: { findOne: async () => null },
  }),
}));

import userMiddleware from '../userMiddleware';

const SECRET = 'SECRET';
const sha = (value: string) => createHash('sha256').update(value).digest('hex');
const newSid = () => randomBytes(32).toString('base64url');

const putSession = (
  subdomain: string,
  sid: string,
  overrides: Record<string, unknown> = {},
) => {
  const now = Date.now();
  mockStore.set(
    `session:${subdomain}:${sha(sid)}`,
    JSON.stringify({
      userId: 'u1',
      method: 'password',
      createdAt: now,
      lastSeenAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      idleSecs: 7 * 24 * 60 * 60,
      ...overrides,
    }),
  );
};

const run = async ({
  cookies = {},
  headers = {},
  hostname = 'acme.erxes.io',
}: {
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  hostname?: string;
}) => {
  const req = {
    cookies,
    headers: { ...headers },
    hostname,
    path: '/graphql',
    originalUrl: '/graphql',
    method: 'POST',
  } as never as Parameters<typeof userMiddleware>[0];

  const res = {
    status: () => ({ json: () => undefined }),
  } as never as Parameters<typeof userMiddleware>[1];

  const next = jest.fn();

  await userMiddleware(req, res, next);

  return { req, next };
};

beforeAll(() => {
  delete process.env.JWT_TOKEN_SECRET;
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

beforeEach(() => {
  mockStore.clear();
  mockTtls.clear();
  mockUsers.acme = [{ _id: 'u1' }, { _id: 'u2', isActive: false }];
  mockUsers.other = [{ _id: 'u1' }];
});

describe('staff session', () => {
  it('accepts a live session and forwards the user header', async () => {
    const sid = newSid();
    putSession('acme', sid);

    const { req, next } = await run({ cookies: { 'erxes-sid': sid } });

    expect(req.user?._id).toBe('u1');
    expect(req.headers.user).toBeTruthy();
    expect(next).toHaveBeenCalled();
  });

  it('rejects a guessed sid', async () => {
    putSession('acme', newSid());

    const { req } = await run({ cookies: { 'erxes-sid': newSid() } });

    expect(req.user).toBeUndefined();
    expect(req.headers.user).toBeUndefined();
  });

  it('rejects the stored hash used as a cookie (Redis read access is not enough)', async () => {
    const sid = newSid();
    putSession('acme', sid);

    const { req } = await run({ cookies: { 'erxes-sid': sha(sid) } });

    expect(req.user).toBeUndefined();
  });

  it('rejects a session from another tenant', async () => {
    const sid = newSid();
    putSession('other', sid);

    const { req } = await run({
      cookies: { '__Host-erxes-sid': sid },
      hostname: 'acme.erxes.io',
    });

    expect(req.user).toBeUndefined();
  });

  it('rejects a revoked session', async () => {
    const sid = newSid();
    putSession('acme', sid);
    mockStore.delete(`session:acme:${sha(sid)}`);

    const { req } = await run({ cookies: { 'erxes-sid': sid } });

    expect(req.user).toBeUndefined();
  });

  it('rejects a deactivated user even with a live session', async () => {
    const sid = newSid();
    putSession('acme', sid, { userId: 'u2' });

    const { req } = await run({ cookies: { 'erxes-sid': sid } });

    expect(req.user).toBeUndefined();
  });

  it('rejects and deletes a session past its absolute expiry', async () => {
    const sid = newSid();
    putSession('acme', sid, { expiresAt: Date.now() - 1 });

    const { req } = await run({ cookies: { 'erxes-sid': sid } });

    expect(req.user).toBeUndefined();
    expect(mockStore.has(`session:acme:${sha(sid)}`)).toBe(false);
  });

  it('slides the idle window but never past the absolute expiry', async () => {
    const sid = newSid();
    const key = `session:acme:${sha(sid)}`;
    putSession('acme', sid, {
      lastSeenAt: Date.now() - 10 * 60 * 1000,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    await run({ cookies: { 'erxes-sid': sid } });

    expect(mockTtls.get(key)).toBeLessThanOrEqual(60 * 60);
    expect(JSON.parse(mockStore.get(key) || '').lastSeenAt).toBeGreaterThan(
      Date.now() - 1000,
    );
  });

  it('does not slide on every request', async () => {
    const sid = newSid();
    putSession('acme', sid);

    await run({ cookies: { 'erxes-sid': sid } });

    expect(mockTtls.size).toBe(0);
  });
});

describe('header spoofing', () => {
  it('strips a forged user header from an anonymous request', async () => {
    const forged = Buffer.from(
      JSON.stringify({ _id: 'u1', isOwner: true }),
    ).toString('base64');

    const { req } = await run({ headers: { user: forged, userid: 'u1' } });

    expect(req.user).toBeUndefined();
    expect(req.headers.user).toBeUndefined();
    expect(req.headers.userid).toBeUndefined();
  });
});

describe('legacy JWT', () => {
  it('rejects a token signed with the fallback secret but never issued', async () => {
    const token = jwt.sign({ user: { _id: 'u1', isOwner: true } }, SECRET);

    const { req } = await run({ cookies: { 'auth-token': token } });

    expect(req.user).toBeUndefined();
  });

  it('rejects an issued token once the user is deactivated', async () => {
    const token = jwt.sign({ user: { _id: 'u2' } }, SECRET);
    mockStore.set(`user_token_u2_${token}`, '1');

    const { req } = await run({ cookies: { 'auth-token': token } });

    expect(req.user).toBeUndefined();
  });

  it('rejects a session cookie value replayed as a bearer token', async () => {
    const sid = newSid();
    putSession('acme', sid);

    const { req } = await run({
      headers: { authorization: `Bearer ${sid}` },
    });

    expect(req.user).toBeUndefined();
  });
});
