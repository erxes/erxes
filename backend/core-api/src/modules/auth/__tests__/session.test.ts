import { createHash } from 'crypto';

const store = new Map<string, string>();
const sets = new Map<string, Set<string>>();
const mockEnv: Record<string, string> = {};
const mockConfigs: Record<string, string> = {};

const mockRedis = {
  get: async (key: string) => store.get(key) ?? null,
  set: async (key: string, value: string) => {
    store.set(key, value);
    return 'OK';
  },
  del: async (...keys: string[]) =>
    keys.filter((key) => store.delete(key)).length,
  mget: async (...keys: string[]) => keys.map((key) => store.get(key) ?? null),
  sismember: async (key: string, member: string) =>
    sets.get(key)?.has(member) ? 1 : 0,
  exists: async (key: string) => (store.has(key) ? 1 : 0),
  sadd: async (key: string, ...members: string[]) => {
    const set = sets.get(key) || new Set<string>();
    members.forEach((member) => set.add(member));
    sets.set(key, set);
    return members.length;
  },
  srem: async (key: string, ...members: string[]) => {
    members.forEach((member) => sets.get(key)?.delete(member));
    return members.length;
  },
  smembers: async (key: string) => [...(sets.get(key) || [])],
  expire: async () => 1,
  multi() {
    const queued: Array<() => Promise<unknown>> = [];
    const chain = {
      set: (key: string, value: string) => {
        queued.push(() => mockRedis.set(key, value));
        return chain;
      },
      sadd: (key: string, ...members: string[]) => {
        queued.push(() => mockRedis.sadd(key, ...members));
        return chain;
      },
      srem: (key: string, ...members: string[]) => {
        queued.push(() => mockRedis.srem(key, ...members));
        return chain;
      },
      del: (...keys: string[]) => {
        queued.push(() => mockRedis.del(...keys));
        return chain;
      },
      expire: () => chain,
      exec: async () => {
        const results: [null, unknown][] = [];
        for (const run of queued) {
          results.push([null, await run()]);
        }
        return results;
      },
    };
    return chain;
  },
};

jest.mock('erxes-api-shared/utils', () => ({
  get redis() {
    return mockRedis;
  },
  getEnv: ({ name }: { name: string }) => mockEnv[name] || '',
  getSaasOrganizationDetail: async () => ({}),
}));

jest.mock('@/organization/settings/utils/configs', () => ({
  getConfig: async (code: string) => mockConfigs[code] || '',
}));

import {
  DEFAULT_SESSION_POLICY,
  endSession,
  getSessionPolicy,
  revokeUserSessions,
  SECURE_SESSION_COOKIE,
  SESSION_COOKIE,
  startSession,
} from '@/auth/session';
import { IModels } from '~/connectionResolvers';

const models = {} as IModels;
const sha = (sid: string) => createHash('sha256').update(sid).digest('hex');

const makeReq = (overrides: Record<string, unknown> = {}) =>
  ({
    secure: true,
    headers: { 'user-agent': 'jest' },
    cookies: {},
    ...overrides,
  } as never);

const makeRes = () => {
  const cookies: Record<
    string,
    { value: string; options: Record<string, unknown> }
  > = {};
  const cleared: string[] = [];

  return {
    cookies,
    cleared,
    res: {
      cookie: (name: string, value: string, options: unknown) => {
        cookies[name] = { value, options: options as Record<string, unknown> };
      },
      clearCookie: (name: string) => cleared.push(name),
    } as never,
  };
};

const signIn = async (userId: string, req = makeReq()) => {
  const { res, cookies } = makeRes();

  await startSession({
    models,
    subdomain: 'acme',
    userId,
    method: 'password',
    req,
    res,
  });

  const [name] = Object.keys(cookies);

  return { name, ...cookies[name] };
};

beforeEach(() => {
  store.clear();
  sets.clear();
  Object.keys(mockEnv).forEach((key) => delete mockEnv[key]);
  Object.keys(mockConfigs).forEach((key) => delete mockConfigs[key]);
});

describe('startSession', () => {
  it('sets a host-only secure cookie and stores only the hash', async () => {
    const { name, value, options } = await signIn('u1');

    expect(name).toBe(SECURE_SESSION_COOKIE);
    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DEFAULT_SESSION_POLICY.absoluteSecs * 1000,
    });
    expect(options.domain).toBeUndefined();

    expect(store.has(`session:acme:${value}`)).toBe(false);
    const session = JSON.parse(store.get(`session:acme:${sha(value)}`) || '');
    expect(session).toMatchObject({ userId: 'u1', method: 'password' });
    expect(sets.get('user_sessions:acme:u1')?.has(sha(value))).toBe(true);
  });

  it('uses the plain cookie name over http', async () => {
    const { name, options } = await signIn('u1', makeReq({ secure: false }));

    expect(name).toBe(SESSION_COOKIE);
    expect(options.secure).toBe(false);
  });

  it('allows cross-site cookies when SAME_SITE=none and the origin differs', async () => {
    mockEnv.SAME_SITE = 'none';
    mockEnv.DOMAIN = 'https://app.example.com';

    const { options } = await signIn(
      'u1',
      makeReq({
        secure: false,
        headers: { origin: 'https://other.example.com' },
      }),
    );

    expect(options).toMatchObject({ sameSite: 'none', secure: true });
  });

  it('prunes hashes of sessions that already expired', async () => {
    const first = await signIn('u1');
    store.delete(`session:acme:${sha(first.value)}`);

    await signIn('u1');

    expect(sets.get('user_sessions:acme:u1')?.size).toBe(1);
  });
});

describe('revocation', () => {
  it('signs a user out everywhere except the kept session', async () => {
    const kept = await signIn('u1');
    const other = await signIn('u1');

    await revokeUserSessions('acme', 'u1', kept.value);

    expect(store.has(`session:acme:${sha(kept.value)}`)).toBe(true);
    expect(store.has(`session:acme:${sha(other.value)}`)).toBe(false);
  });

  it('ends the current session and clears both cookie names', async () => {
    const { value } = await signIn('u1');
    const { res, cleared } = makeRes();

    await endSession({
      subdomain: 'acme',
      req: makeReq({ cookies: { [SECURE_SESSION_COOKIE]: value } }),
      res,
    });

    expect(store.has(`session:acme:${sha(value)}`)).toBe(false);
    expect(sets.get('user_sessions:acme:u1')?.size).toBe(0);
    expect(cleared).toEqual([SECURE_SESSION_COOKIE, SESSION_COOKIE]);
  });
});

describe('getSessionPolicy', () => {
  it('falls back to defaults when unset or invalid', async () => {
    mockConfigs.SESSION_IDLE_MINUTES = 'abc';

    await expect(getSessionPolicy(models)).resolves.toEqual(
      DEFAULT_SESSION_POLICY,
    );
  });

  it('clamps idle to at least five minutes and never past the absolute cap', async () => {
    mockConfigs.SESSION_IDLE_MINUTES = '1';
    mockConfigs.SESSION_MAX_HOURS = '12';

    await expect(getSessionPolicy(models)).resolves.toEqual({
      idleSecs: 5 * 60,
      absoluteSecs: 12 * 60 * 60,
    });

    mockConfigs.SESSION_IDLE_MINUTES = String(24 * 60);

    await expect(getSessionPolicy(models)).resolves.toEqual({
      idleSecs: 12 * 60 * 60,
      absoluteSecs: 12 * 60 * 60,
    });
  });
});
