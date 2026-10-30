/**
 * TwoFactors model against real MongoDB: policy, enrollment, one-time codes
 * and the admin reset.
 */
import { DATABASE } from './twoFactorTestEnv';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { generateModels, IModels } from '~/connectionResolvers';
import { fromBase32, hotp } from '@/auth/twoFactor/totp';

const mockRevokeUserSessions = jest.fn().mockResolvedValue(1);

jest.mock('@/auth/session', () => ({
  ...jest.requireActual('@/auth/session'),
  revokeUserSessions: (...args: unknown[]) => mockRevokeUserSessions(...args),
}));

jest.setTimeout(30_000);

let models: IModels;

const user = (overrides: Partial<IUserDocument> = {}) =>
  ({
    _id: randomUUID(),
    email: 'bat@example.local',
    permissionGroupIds: [],
    ...overrides,
  } as IUserDocument);

const codeNow = (secret: string) =>
  hotp(fromBase32(secret), Math.floor(Date.now() / 1000 / 30));

const enroll = async (member: IUserDocument) => {
  const { secret } = await models.TwoFactors.beginSetup(member);
  const recoveryCodes = await models.TwoFactors.confirmSetup(
    member._id,
    codeNow(secret),
  );

  return { secret, recoveryCodes: recoveryCodes || [] };
};

beforeAll(async () => {
  models = await generateModels('test');
  await mongoose.connection.asPromise();
  await models.TwoFactors.init();
}, 60_000);

beforeEach(async () => {
  await models.TwoFactors.savePolicy({
    mode: 'optional',
    permissionGroupIds: [],
  });
});

afterEach(async () => {
  await models.TwoFactors.collection.deleteMany({});
  await models.Configs.collection.deleteMany({});
  mockRevokeUserSessions.mockClear();
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
  it('is off until an admin turns it on', async () => {
    await models.Configs.collection.deleteMany({});

    await expect(models.TwoFactors.getPolicy()).resolves.toEqual({
      mode: 'off',
      permissionGroupIds: [],
    });
  });

  it('refuses an unknown mode', async () => {
    await expect(
      models.TwoFactors.savePolicy({
        mode: 'sometimes' as never,
        permissionGroupIds: [],
      }),
    ).rejects.toThrow('off, optional or required');
  });

  it('asks only members of the chosen groups to set up when required', async () => {
    await models.TwoFactors.savePolicy({
      mode: 'required',
      permissionGroupIds: ['admins'],
    });

    await expect(
      models.TwoFactors.requirement(user({ permissionGroupIds: ['admins'] })),
    ).resolves.toBe('setup');
    await expect(
      models.TwoFactors.requirement(user({ permissionGroupIds: ['sales'] })),
    ).resolves.toBe('none');
  });

  it('asks everyone when required with no groups', async () => {
    await models.TwoFactors.savePolicy({
      mode: 'required',
      permissionGroupIds: [],
    });

    await expect(models.TwoFactors.requirement(user())).resolves.toBe('setup');
  });

  it('asks enrolled members for a code, and nobody once turned off', async () => {
    const member = user();
    await enroll(member);

    await expect(models.TwoFactors.requirement(member)).resolves.toBe('verify');

    await models.TwoFactors.savePolicy({ mode: 'off', permissionGroupIds: [] });

    await expect(models.TwoFactors.requirement(member)).resolves.toBe('none');
  });
});

describe('enrollment', () => {
  it('stores the secret sealed and turns on only after a correct code', async () => {
    const member = user();
    const { secret, otpauthUrl } = await models.TwoFactors.beginSetup(member);
    const raw = await models.TwoFactors.collection.findOne({
      userId: member._id,
    });

    expect(raw?.secret).not.toContain(secret);
    expect(otpauthUrl).toContain(`secret=${secret}`);
    await expect(models.TwoFactors.requirement(member)).resolves.toBe('none');

    await expect(
      models.TwoFactors.confirmSetup(member._id, '000000'),
    ).resolves.toBeNull();

    const codes = await models.TwoFactors.confirmSetup(
      member._id,
      codeNow(secret),
    );
    const stored = await models.TwoFactors.collection.findOne({
      userId: member._id,
    });

    expect(codes).toHaveLength(10);
    expect(stored?.recoveryCodeHashes).toHaveLength(10);
    expect(JSON.stringify(stored)).not.toContain(codes?.[0]);
  });

  it('refuses setup while the organization has 2FA off', async () => {
    await models.TwoFactors.savePolicy({ mode: 'off', permissionGroupIds: [] });

    await expect(models.TwoFactors.beginSetup(user())).rejects.toThrow(
      'turned off',
    );
  });

  it('cannot restart setup over an enabled 2FA', async () => {
    const member = user();
    await enroll(member);

    await expect(models.TwoFactors.beginSetup(member)).rejects.toThrow(
      'already on',
    );
  });
});

describe('codes', () => {
  it('accepts an authenticator code once', async () => {
    const member = user();
    const { secret } = await enroll(member);
    const doc = await models.TwoFactors.findOne({ userId: member._id });
    // The setup code used the current step; take the next one
    const next = hotp(fromBase32(secret), (doc?.lastUsedStep ?? 0) + 1);

    await expect(models.TwoFactors.verifyCode(member._id, next)).resolves.toBe(
      true,
    );
    await expect(models.TwoFactors.verifyCode(member._id, next)).resolves.toBe(
      false,
    );
  });

  it('refuses the code that finished setup', async () => {
    const member = user();
    const { secret } = await models.TwoFactors.beginSetup(member);
    const code = codeNow(secret);
    await models.TwoFactors.confirmSetup(member._id, code);

    await expect(models.TwoFactors.verifyCode(member._id, code)).resolves.toBe(
      false,
    );
  });

  it('accepts each recovery code once', async () => {
    const member = user();
    const { recoveryCodes } = await enroll(member);

    await expect(
      models.TwoFactors.verifyCode(member._id, recoveryCodes[0]),
    ).resolves.toBe(true);
    await expect(
      models.TwoFactors.verifyCode(member._id, recoveryCodes[0]),
    ).resolves.toBe(false);
    await expect(models.TwoFactors.status(member)).resolves.toMatchObject({
      enabled: true,
      recoveryCodesLeft: 9,
    });
  });

  it("does not accept another member's codes", async () => {
    const owner = user();
    const other = user();
    const { recoveryCodes } = await enroll(owner);
    await enroll(other);

    await expect(
      models.TwoFactors.verifyCode(other._id, recoveryCodes[0]),
    ).resolves.toBe(false);
  });
});

describe('turning off', () => {
  it('needs a valid code', async () => {
    const member = user();
    await enroll(member);

    await expect(models.TwoFactors.disable(member, '000000')).rejects.toThrow(
      'Invalid two-factor code',
    );
  });

  it('is not allowed while the policy requires it', async () => {
    const member = user();
    const { recoveryCodes } = await enroll(member);
    await models.TwoFactors.savePolicy({
      mode: 'required',
      permissionGroupIds: [],
    });

    await expect(
      models.TwoFactors.disable(member, recoveryCodes[0]),
    ).rejects.toThrow('required');
  });

  it('lets an admin reset a lost phone, ending every session', async () => {
    const member = user();
    await enroll(member);

    await models.TwoFactors.reset(member._id);

    await expect(models.TwoFactors.status(member)).resolves.toMatchObject({
      enabled: false,
    });
    expect(mockRevokeUserSessions).toHaveBeenCalledWith('test', member._id);
  });
});
