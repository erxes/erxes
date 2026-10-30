const mockReadDirectoryStates = jest.fn();
const mockRevokeUserSessions = jest.fn();

jest.mock('@/auth/ldap/client', () => ({
  ...jest.requireActual('@/auth/ldap/client'),
  readDirectoryStates: (...args: unknown[]) => mockReadDirectoryStates(...args),
}));

jest.mock('@/auth/session', () => ({
  revokeUserSessions: (...args: unknown[]) => mockRevokeUserSessions(...args),
}));

import {
  ILdapRecheckChange,
  ILdapRecheckRun,
} from '@/auth/db/definitions/ldap';
import { loadAuthIdentityClass } from '@/auth/db/models/Ldap';
import { IModels } from '~/connectionResolvers';

const ALLOWED = 'cn=erxes-users,ou=groups,dc=example,dc=local';
const SALES = 'cn=sales,ou=groups,dc=example,dc=local';

const baseConfig = {
  enabled: true,
  serverType: 'openLdap',
  allowedGroupDns: [ALLOWED],
  groupMappings: [] as { groupDn: string; permissionGroupIds: string[] }[],
  groupChangePolicy: 'updatePermissions',
  recheckEveryMinutes: 15,
};

const recordRecheck = jest.fn();
const updateUser = jest.fn();

const setup = ({
  config = {},
  identities = [{ userId: 'u1', subject: 's1' }],
  users = [{ _id: 'u1', permissionGroupIds: [] as string[] }],
}: {
  config?: Partial<typeof baseConfig>;
  identities?: { userId: string; subject: string }[];
  users?: { _id: string; permissionGroupIds: string[] }[];
} = {}) => {
  const connection = { ...baseConfig, ...config };

  const models = {
    LdapConfigs: {
      getLdapConfig: async () => connection,
      getConnectionConfig: async () => connection,
      recordRecheck,
    },
    AuthIdentities: { find: () => ({ lean: async () => identities }) },
    Users: {
      find: () => ({ lean: async () => users }),
      updateOne: updateUser,
    },
  } as never as IModels;

  // loadClass puts statics on the schema; the method only uses the models it closes over
  const { recheckLdapUsers } = loadAuthIdentityClass(models, 'acme')
    .statics as unknown as {
    recheckLdapUsers: () => Promise<ILdapRecheckRun | null>;
  };

  return recheckLdapUsers;
};

const recorded = (): ILdapRecheckChange[] => recordRecheck.mock.calls[0][1];

beforeEach(() => {
  jest.clearAllMocks();
  mockRevokeUserSessions.mockResolvedValue(1);
});

describe('lost access ends sessions', () => {
  it.each([
    ['removed', new Map()],
    ['disabled', new Map([['s1', { groupDns: [ALLOWED], disabled: true }]])],
    ['left_group', new Map([['s1', { groupDns: [SALES], disabled: false }]])],
  ])('signs out a user who was %s', async (reason, states) => {
    mockReadDirectoryStates.mockResolvedValue(states);

    const run = await setup()();

    expect(mockRevokeUserSessions).toHaveBeenCalledWith('acme', 'u1');
    expect(run).toMatchObject({ status: 'ok', checked: 1 });
    expect(recorded()).toEqual([
      expect.objectContaining({ userId: 'u1', reason, signedOut: true }),
    ]);
  });

  it('matches group DNs case-insensitively, as login does', async () => {
    mockReadDirectoryStates.mockResolvedValue(
      new Map([['s1', { groupDns: [ALLOWED.toUpperCase()], disabled: false }]]),
    );

    await setup()();

    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
  });

  it('keeps linked members when no allowed groups are set', async () => {
    mockReadDirectoryStates.mockResolvedValue(
      new Map([['s1', { groupDns: [], disabled: false }]]),
    );

    await setup({ config: { allowedGroupDns: [] } })();

    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
    expect(recorded()).toEqual([]);
  });

  it('does not record a user who had no sessions left to end', async () => {
    mockReadDirectoryStates.mockResolvedValue(new Map());
    mockRevokeUserSessions.mockResolvedValue(0);

    await setup()();

    expect(recorded()).toEqual([]);
  });
});

describe('mapped group changes', () => {
  const mappings = [{ groupDn: SALES, permissionGroupIds: ['pg-sales'] }];
  const movedToSales = new Map([
    ['s1', { groupDns: [ALLOWED, SALES], disabled: false }],
  ]);

  it('updates permissions and keeps the user signed in by default', async () => {
    mockReadDirectoryStates.mockResolvedValue(movedToSales);

    await setup({ config: { groupMappings: mappings } })();

    expect(updateUser).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $set: { permissionGroupIds: ['pg-sales'] } },
    );
    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
    expect(recorded()).toEqual([
      expect.objectContaining({
        reason: 'permissions_changed',
        signedOut: false,
      }),
    ]);
  });

  it('also signs the user out under the revokeSessions policy', async () => {
    mockReadDirectoryStates.mockResolvedValue(movedToSales);

    await setup({
      config: { groupMappings: mappings, groupChangePolicy: 'revokeSessions' },
    })();

    expect(mockRevokeUserSessions).toHaveBeenCalledWith('acme', 'u1');
    expect(recorded()).toEqual([
      expect.objectContaining({
        reason: 'permissions_changed',
        signedOut: true,
      }),
    ]);
  });

  it('changes nothing when permissions already match', async () => {
    mockReadDirectoryStates.mockResolvedValue(movedToSales);

    await setup({
      config: { groupMappings: mappings },
      users: [{ _id: 'u1', permissionGroupIds: ['pg-sales'] }],
    })();

    expect(updateUser).not.toHaveBeenCalled();
    expect(recorded()).toEqual([]);
  });
});

describe('safety', () => {
  it('signs nobody out when the directory is unreachable', async () => {
    mockReadDirectoryStates.mockRejectedValue(
      new Error('connect ECONNREFUSED'),
    );

    const run = await setup()();

    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(run).toMatchObject({
      status: 'failed',
      error: 'connect ECONNREFUSED',
    });
    expect(recorded()).toEqual([]);
  });

  it('does nothing while LDAP is disabled', async () => {
    const run = await setup({ config: { enabled: false } })();

    expect(run).toBeNull();
    expect(mockReadDirectoryStates).not.toHaveBeenCalled();
    expect(recordRecheck).not.toHaveBeenCalled();
  });
});
