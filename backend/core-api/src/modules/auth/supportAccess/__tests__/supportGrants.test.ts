/**
 * SupportGrants against real MongoDB: the policy decides who enters, the owner
 * answers requests once, and ending a grant closes every way back in.
 */
import { DATABASE } from './supportAccessTestEnv';
import mongoose from 'mongoose';
import { generateModels, IModels } from '~/connectionResolvers';
import { ISupportStaff } from '@/auth/supportAccess/token';

const mockRevokeUserSessions = jest.fn().mockResolvedValue(1);
const mockArmEnd = jest.fn().mockResolvedValue(undefined);
const mockSendNotification = jest.fn().mockResolvedValue(undefined);

jest.mock('@/auth/session', () => ({
  ...jest.requireActual('@/auth/session'),
  revokeUserSessions: (...args: unknown[]) => mockRevokeUserSessions(...args),
}));

jest.mock('@/auth/supportAccess/queue', () => ({
  armSupportAccessEnd: (...args: unknown[]) => mockArmEnd(...args),
}));

jest.mock('@/auth/supportAccess/permissionGroups', () => ({
  getAdminGroupIds: async () => ['sales:admin', 'frontline:admin'],
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  ...jest.requireActual('erxes-api-shared/core-modules'),
  sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  clearGroupActionsCache: jest.fn(),
}));

jest.setTimeout(30_000);

const HOUR_SECS = 60 * 60;

let models: IModels;

const staff = (overrides: Partial<ISupportStaff> = {}): ISupportStaff => ({
  staffId: 'staff_bat',
  name: 'Bat',
  email: 'bat@erxes.io',
  reason: 'Setup: pipeline',
  ...overrides,
});

const notifiedEvents = () =>
  mockSendNotification.mock.calls.map(([, data]) => data.action);

const pendingGrant = async () => {
  await models.SupportGrants.enter(staff());

  const grant = await models.SupportGrants.findOne({ status: 'pending' });

  if (!grant) {
    throw new Error('Expected a pending request');
  }

  return grant;
};

const supportUser = async () => {
  const identity = await models.AuthIdentities.findOne({
    provider: 'erxes_support',
    subject: 'staff_bat',
  });

  return models.Users.findOne({ _id: identity?.userId }).lean();
};

beforeAll(async () => {
  models = await generateModels('test');
  await mongoose.connection.asPromise();
  await models.SupportGrants.init();
  await models.AuthIdentities.init();
}, 60_000);

// Requests and visits are announced to the owners
beforeEach(async () => {
  await models.Users.collection.insertOne({
    _id: 'owner1' as never,
    email: 'owner@acme.local',
    isOwner: true,
    isActive: true,
  });
});

afterEach(async () => {
  await Promise.all([
    models.SupportGrants.collection.deleteMany({}),
    models.AuthIdentities.collection.deleteMany({}),
    models.Users.collection.deleteMany({}),
    models.Configs.collection.deleteMany({}),
    models.OAuthRefreshTokens.collection.deleteMany({}),
  ]);
  jest.clearAllMocks();
});

afterAll(async () => {
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.close();
});

describe('policy', () => {
  it('asks the owner until someone chooses otherwise', async () => {
    await expect(models.SupportGrants.getPolicy()).resolves.toMatchObject({
      mode: 'approval',
      configuredMode: 'approval',
      permissionGroupIds: [],
    });
  });

  it('turns an ended allow window back into approval', async () => {
    await models.SupportGrants.savePolicy({
      mode: 'allow',
      allowUntil: new Date(Date.now() - 1000),
      permissionGroupIds: [],
    });

    await expect(models.SupportGrants.getPolicy()).resolves.toMatchObject({
      mode: 'approval',
      configuredMode: 'allow',
    });
  });

  it('keeps an end date and groups only for the allow window', async () => {
    const policy = await models.SupportGrants.savePolicy({
      mode: 'approval',
      allowUntil: new Date(Date.now() + HOUR_SECS * 1000),
      permissionGroupIds: ['sales:admin'],
    });

    expect(policy.allowUntil).toBeUndefined();
    expect(policy.permissionGroupIds).toEqual([]);
  });
});

describe('approval', () => {
  it('opens one request, as an inactive support user, and tells the owner once', async () => {
    await expect(models.SupportGrants.enter(staff())).resolves.toEqual({
      outcome: 'pending',
    });
    await models.SupportGrants.enter(staff({ reason: 'Setup: forms' }));

    const grants = await models.SupportGrants.find({});
    const user = await supportUser();

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      status: 'pending',
      reason: 'Setup: forms',
    });
    expect(user).toMatchObject({
      email: 'staff_bat@support.erxes.invalid',
      isActive: false,
    });
    expect(user?.isOwner).toBeFalsy();
    expect(user?.password).toBeUndefined();
    expect(user?.details?.fullName).toBe('Bat (erxes support)');
    expect(notifiedEvents()).toEqual(['requested']);
  });

  it('lets the staff member in after approval, capped by the grant', async () => {
    const grant = await pendingGrant();

    await models.SupportGrants.approve(
      grant._id,
      { hours: 1, permissionGroupIds: ['sales:admin'] },
      'owner1',
    );

    const visit = await models.SupportGrants.enter(staff());

    if (visit.outcome !== 'entered') {
      throw new Error('Expected to enter');
    }

    expect(visit.sessionPolicy.absoluteSecs).toBeLessThanOrEqual(HOUR_SECS);
    expect(visit.sessionPolicy.idleSecs).toBeLessThanOrEqual(HOUR_SECS);
    await expect(supportUser()).resolves.toMatchObject({
      isActive: true,
      permissionGroupIds: ['sales:admin'],
    });
    expect(mockArmEnd).toHaveBeenCalledTimes(1);
    expect(notifiedEvents()).toEqual(['requested', 'entered']);

    const visited = await models.SupportGrants.findOne({ _id: grant._id });

    expect(visited?.visits).toHaveLength(1);
  });

  it('caps a session at 8 hours even on a 7 day grant', async () => {
    const grant = await pendingGrant();

    await models.SupportGrants.approve(
      grant._id,
      { hours: 168, permissionGroupIds: ['sales:admin'] },
      'owner1',
    );

    const visit = await models.SupportGrants.enter(staff());

    expect(visit).toMatchObject({
      outcome: 'entered',
      sessionPolicy: { absoluteSecs: 8 * HOUR_SECS },
    });
  });

  it('answers a request once', async () => {
    const grant = await pendingGrant();

    await models.SupportGrants.deny(grant._id, 'owner1');

    await expect(
      models.SupportGrants.approve(
        grant._id,
        { hours: 4, permissionGroupIds: ['sales:admin'] },
        'owner2',
      ),
    ).rejects.toThrow('already answered');
    await expect(models.SupportGrants.enter(staff())).resolves.toEqual({
      outcome: 'pending',
    });
  });

  it.each([
    ['an unknown duration', { hours: 3, permissionGroupIds: ['sales:admin'] }],
    ['no permission groups', { hours: 4, permissionGroupIds: [] }],
  ])('refuses %s', async (_label, approval) => {
    const grant = await pendingGrant();

    await expect(
      models.SupportGrants.approve(grant._id, approval, 'owner1'),
    ).rejects.toThrow();
  });
});

describe('allow window', () => {
  it('lets the staff member in for 4 hours with every admin group', async () => {
    await models.SupportGrants.savePolicy({
      mode: 'allow',
      allowUntil: new Date(Date.now() + 24 * HOUR_SECS * 1000),
      permissionGroupIds: [],
    });

    const visit = await models.SupportGrants.enter(staff());
    const grant = await models.SupportGrants.findOne({});

    expect(visit.outcome).toBe('entered');
    expect(grant).toMatchObject({
      status: 'approved',
      autoApproved: true,
      permissionGroupIds: ['sales:admin', 'frontline:admin'],
    });
    expect(
      (grant?.endsAt?.getTime() ?? 0) - Date.now(),
    ).toBeLessThanOrEqual(4 * HOUR_SECS * 1000);
  });

  it('lets nobody in when off', async () => {
    await models.SupportGrants.savePolicy({
      mode: 'off',
      permissionGroupIds: [],
    });

    await expect(models.SupportGrants.enter(staff())).resolves.toEqual({
      outcome: 'off',
    });
    await expect(supportUser()).resolves.toBeNull();
  });
});

describe('ending access', () => {
  const enterApproved = async () => {
    const grant = await pendingGrant();

    await models.SupportGrants.approve(
      grant._id,
      { hours: 4, permissionGroupIds: ['sales:admin'] },
      'owner1',
    );
    await models.SupportGrants.enter(staff());

    return grant;
  };

  it('revoke signs the support user out and spends its device tokens', async () => {
    const grant = await enterApproved();
    const user = await supportUser();

    await models.OAuthRefreshTokens.collection.insertOne({
      userId: user?._id,
      tokenHash: 'h1',
    });

    await models.SupportGrants.revoke(grant._id, 'owner1');

    await expect(supportUser()).resolves.toMatchObject({ isActive: false });
    expect(mockRevokeUserSessions).toHaveBeenCalledWith('test', user?._id);
    await expect(
      models.OAuthRefreshTokens.collection.findOne({ tokenHash: 'h1' }),
    ).resolves.toMatchObject({ revokedAt: expect.any(Date) });
    await expect(
      models.SupportGrants.revoke(grant._id, 'owner1'),
    ).rejects.toThrow('already ended');
  });

  it('keeps access while a grant still covers it', async () => {
    await enterApproved();
    const user = await supportUser();

    await models.SupportGrants.endAccess(String(user?._id));

    await expect(supportUser()).resolves.toMatchObject({ isActive: true });
    expect(mockRevokeUserSessions).not.toHaveBeenCalled();
  });

  it('lists a grant past its end as expired', async () => {
    const grant = await enterApproved();

    await models.SupportGrants.updateOne(
      { _id: grant._id },
      { $set: { endsAt: new Date(Date.now() - 1000) } },
    );

    await expect(models.SupportGrants.listGrants('expired')).resolves.toEqual([
      expect.objectContaining({ _id: grant._id }),
    ]);
    await expect(models.SupportGrants.listGrants('approved')).resolves.toEqual(
      [],
    );
  });
});

describe('support accounts', () => {
  it('have no password and no hand edits', async () => {
    await models.SupportGrants.enter(staff());
    const user = await supportUser();
    const userId = String(user?._id);

    await expect(models.Users.assertLocalPassword(userId)).rejects.toThrow(
      'no password',
    );
    await expect(
      models.Users.editProfile(userId, { email: 'me@personal.local' }),
    ).rejects.toThrow('managed by support access');
    await expect(
      models.Users.updateUser(userId, { permissionGroupIds: ['core:admin'] }),
    ).rejects.toThrow('managed by support access');
    await expect(models.Users.isSupportUser(userId)).resolves.toBe(true);
  });
});
