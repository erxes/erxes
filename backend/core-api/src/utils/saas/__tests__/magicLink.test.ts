import * as jwt from 'jsonwebtoken';

const mockStore = new Map<string, string>();
const mockStartSession = jest.fn();
const mockGenerateModels = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: () => '',
  getSubdomain: () => 'acme',
  USER_ROLES: { SYSTEM: 'system' },
  redis: {
    set: async (key: string, value: string, ...args: unknown[]) => {
      if (args.includes('NX') && mockStore.has(key)) {
        return null;
      }
      mockStore.set(key, value);
      return 'OK';
    },
  },
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: (subdomain: string) => mockGenerateModels(subdomain),
}));

jest.mock('~/modules/auth/session', () => ({
  startSession: (params: unknown) => mockStartSession(params),
}));

jest.mock('~/modules/notifications/utils', () => ({
  sendOnboardNotification: async () => undefined,
}));

import { MAGIC_LINK_STATE, magiclinkCallback } from '~/utils/saas';

const SECRET = 'SECRET';

const mockUsers: Record<string, { _id: string; isActive: boolean }[]> = {};

const signState = (overrides: Record<string, unknown> = {}, secret = SECRET) =>
  jwt.sign(
    {
      typ: MAGIC_LINK_STATE,
      jti: 'link-1',
      userId: 'u1',
      subdomain: 'acme',
      ...overrides,
    },
    secret,
    { expiresIn: '1d' },
  );

const callback = async (state: string) => {
  const res = {
    redirect: jest.fn(),
    end: jest.fn(),
    cookie: jest.fn(),
  };

  await magiclinkCallback(
    { query: { state }, headers: {} } as never,
    res as never,
  );

  return res;
};

beforeAll(() => {
  delete process.env.JWT_TOKEN_SECRET;
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

beforeEach(() => {
  mockStore.clear();
  mockStartSession.mockReset();
  mockGenerateModels.mockReset();
  mockUsers.acme = [{ _id: 'u1', isActive: true }];
  mockUsers.other = [{ _id: 'u9', isActive: true }];

  mockGenerateModels.mockImplementation(async (subdomain: string) => ({
    Users: {
      findOne: async (query: { _id: string; isActive?: boolean }) =>
        (mockUsers[subdomain] || []).find(
          (user) =>
            user._id === query._id &&
            (query.isActive === undefined || user.isActive === query.isActive),
        ) || null,
    },
  }));
});

describe('magic link callback', () => {
  it('starts one session for a valid link', async () => {
    await callback(signState());

    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(mockStartSession.mock.calls[0][0]).toMatchObject({
      subdomain: 'acme',
      userId: 'u1',
      method: 'magic_link',
    });
  });

  it('refuses to replay a link that was already used', async () => {
    const state = signState();

    await callback(state);
    const replay = await callback(state);

    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(replay.redirect).toHaveBeenCalledWith('/login');
  });

  it('refuses an old staff token used as a link state', async () => {
    const staffToken = jwt.sign({ user: { _id: 'u1', isOwner: true } }, SECRET);

    const res = await callback(staffToken);

    expect(mockStartSession).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('refuses a state signed with another secret', async () => {
    await callback(signState({}, 'attacker-secret'));

    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('refuses another signed token shaped like a link state', async () => {
    const res = await callback(signState({ typ: 'oauth_access' }));

    expect(mockStartSession).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('refuses a link for a deactivated user', async () => {
    mockUsers.acme = [{ _id: 'u1', isActive: false }];

    const res = await callback(signState());

    expect(mockStartSession).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('signs in to the tenant named in the signed state, not a shared key', async () => {
    await callback(signState({ jti: 'link-2', userId: 'u9', subdomain: 'other' }));

    expect(mockGenerateModels).toHaveBeenCalledWith('other');
    expect(mockStartSession.mock.calls[0][0]).toMatchObject({
      subdomain: 'other',
      userId: 'u9',
    });
  });
});
