/**
 * Sign-in with two-factor: no session before the second factor, and the
 * challenge cannot be stretched, swapped or replayed.
 */
const mockStartSession = jest.fn();
const mockChallenges = new Map<
  string,
  { userId: string; method: string; setup: boolean; attempts: number }
>();
const mockFailChallenge = jest.fn();
const mockRecordFailure = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/errorClassifier'),
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  getEnv: () => '',
  logHandler: (run: () => unknown) => run(),
  markResolvers: jest.fn(),
  updateSaasOrganization: jest.fn(),
}));

jest.mock('@/auth/session', () => ({
  startSession: (params: unknown) => mockStartSession(params),
  endSession: jest.fn(),
}));

jest.mock('@/auth/twoFactor/challenge', () => ({
  createTwoFactorChallenge: async (
    _subdomain: string,
    challenge: { userId: string; method: string; setup: boolean },
  ) => {
    const token = `challenge-${mockChallenges.size + 1}`;
    mockChallenges.set(token, { ...challenge, attempts: 0 });
    return token;
  },
  readTwoFactorChallenge: async (_subdomain: string, token: string) =>
    mockChallenges.get(token) ?? null,
  failTwoFactorChallenge: (...args: unknown[]) => mockFailChallenge(...args),
  endTwoFactorChallenge: async (_subdomain: string, token: string) =>
    mockChallenges.delete(token),
}));

jest.mock('@/auth/utils', () => ({
  assertLoginAllowed: jest.fn(),
  clearLoginFailures: jest.fn(),
  recordLoginFailure: (...args: unknown[]) => mockRecordFailure(...args),
  getRequestIp: () => '10.0.0.1',
  getCallbackRedirectUrl: jest.fn(),
  isValidEmail: jest.fn(),
  sendSaasMagicLinkEmail: jest.fn(),
}));

jest.mock('@/auth/ldap/worker', () => ({ armLdapRecheck: jest.fn() }));
jest.mock('~/utils/saas', () => ({
  assertSaasEnvironment: jest.fn(),
  MAGIC_LINK_STATE: 'magic_link_state',
}));
jest.mock('~/utils/email', () => ({ sendEmail: jest.fn() }));
jest.mock('@/auth/routes/oauth/utils', () => ({ checkRateLimit: jest.fn() }));
jest.mock('@workos-inc/node', () => ({ WorkOS: jest.fn() }));
jest.mock('@/organization/team-member/graphql/mutations', () => ({
  validatePermissionGroupIds: jest.fn(),
}));

import { authMutations } from '@/auth/graphql/resolvers/mutations';
import { twoFactorLoginMutations } from '@/auth/graphql/resolvers/twoFactor';
import { LoginError } from '@/auth/loginError';
import { IContext } from '~/connectionResolvers';

const member = {
  _id: 'u1',
  email: 'bat@example.local',
  permissionGroupIds: [],
};

const makeContext = ({
  requirement = 'verify',
  codeOk = true,
  active = true,
}: {
  requirement?: 'none' | 'verify' | 'setup';
  codeOk?: boolean;
  active?: boolean;
} = {}) =>
  ({
    subdomain: 'acme',
    req: { headers: {} },
    res: {},
    requestInfo: { cookies: {} },
    models: {
      Users: {
        login: async () => ({ user: member, method: 'password' }),
        // Awaited directly or through .lean(), as the resolvers do
        findOne: () => {
          const found = Promise.resolve(active ? member : null);
          return Object.assign(found, { lean: () => found });
        },
        getUser: async () => member,
      },
      TwoFactors: {
        requirement: async () => requirement,
        verifyCode: async () => codeOk,
        confirmSetup: async () => (codeOk ? ['aaaa-bbbb'] : null),
        beginSetup: async () => ({ secret: 'S', otpauthUrl: 'otpauth://x' }),
      },
    },
  } as never as IContext);

const login = (context: IContext) =>
  authMutations.login(
    undefined,
    { email: 'bat@example.local', password: 'secret' },
    context,
  );

const loginError = async (run: Promise<unknown>) => {
  try {
    await run;
  } catch (e) {
    return e as LoginError;
  }
  throw new Error('expected a LoginError');
};

beforeEach(() => {
  mockChallenges.clear();
  jest.clearAllMocks();
});

describe('login with two-factor', () => {
  it('starts no session and hands back a challenge when a code is needed', async () => {
    const error = await loginError(login(makeContext()));

    expect(error.reason).toBe('two_factor_required');
    expect(error.extensions.challenge).toBe('challenge-1');
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('asks members who must set up first', async () => {
    const error = await loginError(
      login(makeContext({ requirement: 'setup' })),
    );

    expect(error.reason).toBe('two_factor_setup_required');
    expect(mockChallenges.get('challenge-1')?.setup).toBe(true);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('signs in straight away when two-factor does not apply', async () => {
    await login(makeContext({ requirement: 'none' }));

    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });
});

describe('the second step', () => {
  const verify = (
    context: IContext,
    challenge = 'challenge-1',
    code = '123456',
  ) =>
    twoFactorLoginMutations.loginTwoFactorVerify(
      undefined,
      { challenge, code },
      context,
    );

  it('starts the session with the first step method and ends the challenge', async () => {
    await loginError(login(makeContext()));

    await expect(verify(makeContext())).resolves.toEqual([]);
    expect(mockStartSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', method: 'password' }),
    );
    expect(mockChallenges.size).toBe(0);
  });

  it('refuses a wrong code, counting it against the challenge and the account', async () => {
    await loginError(login(makeContext()));

    const error = await loginError(verify(makeContext({ codeOk: false })));

    expect(error.reason).toBe('two_factor_invalid');
    expect(mockFailChallenge).toHaveBeenCalled();
    expect(mockRecordFailure).toHaveBeenCalledWith('acme', '2fa:u1');
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('refuses an unknown or used challenge', async () => {
    await loginError(login(makeContext()));
    await verify(makeContext());

    const error = await loginError(verify(makeContext()));

    expect(error.reason).toBe('two_factor_expired');
    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });

  it('refuses a member deactivated between the two steps', async () => {
    await loginError(login(makeContext()));

    const error = await loginError(verify(makeContext({ active: false })));

    expect(error.reason).toBe('two_factor_expired');
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('returns recovery codes when the code finishes setup', async () => {
    await loginError(login(makeContext({ requirement: 'setup' })));

    await expect(verify(makeContext())).resolves.toEqual(['aaaa-bbbb']);
    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });

  it('will not start setup from a code challenge, so 2FA cannot be replaced', async () => {
    await loginError(login(makeContext()));

    const error = await loginError(
      twoFactorLoginMutations.loginTwoFactorSetup(
        undefined,
        { challenge: 'challenge-1' },
        makeContext(),
      ),
    );

    expect(error.reason).toBe('two_factor_expired');
  });
});
