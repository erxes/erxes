import { sendTRPCMessage } from 'erxes-api-shared/utils';
import SyncLog from '@/erkhet/graphql/resolvers/customResolvers/syncLog';
import { IContext } from '~/connectionResolvers';
import { ISyncLogDocument } from '@/erkhet/@types/syncLog';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

type CoreUser = Record<string, unknown> & { _id: string };

const sendMessage = jest.mocked(sendTRPCMessage);
const context = { subdomain: 'acme' } as IContext;
const syncLog = (createdBy?: string) =>
  ({ _id: 'log-1', createdBy }) as ISyncLogDocument;

const coreUsers: CoreUser[] = [
  {
    _id: 'user-1',
    email: 'bat@acme.mn',
    username: 'bat',
    details: { fullName: 'Bat Erdene' },
    password: '$2a$10$hashedpassword',
    resetPasswordToken: 'reset-token',
    registrationToken: 'registration-token',
    deviceTokens: ['device-token'],
  },
];

const fakeCoreUsersFind = ({
  query,
  fields,
}: {
  query: { _id: string };
  fields?: Record<string, number>;
}) =>
  coreUsers
    .filter((user) => user._id === query._id)
    .map((user) =>
      fields
        ? Object.fromEntries(
            Object.entries(user).filter(([key]) => fields[key]),
          )
        : user,
    );

beforeEach(() => {
  jest.clearAllMocks();
  sendMessage.mockImplementation(async ({ module, action, input }) =>
    module === 'users' && action === 'find' ? fakeCoreUsersFind(input) : null,
  );
});

describe('Erkhet sync history createdUser', () => {
  it('returns the email and name of the user who synced', async () => {
    await expect(
      SyncLog.createdUser(syncLog('user-1'), {}, context),
    ).resolves.toEqual({
      _id: 'user-1',
      email: 'bat@acme.mn',
      username: 'bat',
      details: { fullName: 'Bat Erdene' },
    });
  });

  it('never exposes the password hash or tokens to the history list', async () => {
    const user = await SyncLog.createdUser(syncLog('user-1'), {}, context);

    expect(user).toMatchObject({ email: 'bat@acme.mn' });
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('resetPasswordToken');
    expect(user).not.toHaveProperty('registrationToken');
    expect(user).not.toHaveProperty('deviceTokens');
  });

  it('returns null without asking core when the log was created by the system', async () => {
    await expect(
      SyncLog.createdUser(syncLog(), {}, context),
    ).resolves.toBeNull();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('returns null when the user who synced has been removed', async () => {
    await expect(
      SyncLog.createdUser(syncLog('deleted-user'), {}, context),
    ).resolves.toBeNull();
  });

  it('returns null when core is unreachable', async () => {
    sendMessage.mockImplementation(async ({ defaultValue }) => defaultValue);

    await expect(
      SyncLog.createdUser(syncLog('user-1'), {}, context),
    ).resolves.toBeNull();
  });
});
