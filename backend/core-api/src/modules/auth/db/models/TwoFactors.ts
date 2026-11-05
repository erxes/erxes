import { IUserDocument } from 'erxes-api-shared/core-types';
import { getEnv } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { openSecret, sealSecret } from '@/agents/secretBox';
import {
  ITwoFactorDocument,
  ITwoFactorPolicy,
  TwoFactorMode,
  twoFactorSchema,
} from '@/auth/db/definitions/twoFactor';
import { revokeUserSessions } from '@/auth/session';
import {
  hashRecoveryCode,
  newRecoveryCodes,
  newTotpSecret,
  otpauthUrl,
  verifyTotp,
} from '@/auth/twoFactor/totp';

const MODE_CONFIG = 'TWO_FACTOR_MODE';
const GROUPS_CONFIG = 'TWO_FACTOR_PERMISSION_GROUP_IDS';
const MODES: TwoFactorMode[] = ['off', 'optional', 'required'];

export type TwoFactorRequirement = 'none' | 'verify' | 'setup';

export interface ITwoFactorStatus {
  // False while the organization has 2FA off
  available: boolean;
  enabled: boolean;
  required: boolean;
  recoveryCodesLeft: number;
}

export interface ITwoFactorModel extends Model<ITwoFactorDocument> {
  getPolicy(): Promise<ITwoFactorPolicy>;
  savePolicy(policy: ITwoFactorPolicy): Promise<ITwoFactorPolicy>;
  isRequiredFor(user: IUserDocument): Promise<boolean>;
  requirement(user: IUserDocument): Promise<TwoFactorRequirement>;
  status(user: IUserDocument): Promise<ITwoFactorStatus>;
  beginSetup(
    user: IUserDocument,
  ): Promise<{ secret: string; otpauthUrl: string }>;
  confirmSetup(userId: string, code: string): Promise<string[] | null>;
  verifyCode(userId: string, code: string): Promise<boolean>;
  disable(user: IUserDocument, code: string): Promise<boolean>;
  regenerateRecoveryCodes(userId: string, code: string): Promise<string[]>;
  reset(userId: string): Promise<boolean>;
}

const invalidCode = () => new Error('Invalid two-factor code');

export const loadTwoFactorClass = (models: IModels, subdomain: string) => {
  const findConfirmed = (userId: string) =>
    models.TwoFactors.findOne({ userId, confirmedAt: { $exists: true } });

  class TwoFactor {
    public static async getPolicy(): Promise<ITwoFactorPolicy> {
      const [mode, groups] = await Promise.all([
        models.Configs.findOne({ code: MODE_CONFIG }).lean(),
        models.Configs.findOne({ code: GROUPS_CONFIG }).lean(),
      ]);

      // Configs store string lists, so the mode is kept as a one-item list
      const storedMode = Array.isArray(mode?.value) ? mode.value[0] : undefined;

      return {
        mode: MODES.includes(storedMode) ? storedMode : 'off',
        permissionGroupIds: Array.isArray(groups?.value) ? groups.value : [],
      };
    }

    public static async savePolicy({
      mode,
      permissionGroupIds,
    }: ITwoFactorPolicy) {
      if (!MODES.includes(mode)) {
        throw new Error('Two-factor mode must be off, optional or required');
      }

      await models.Configs.createOrUpdateConfig({
        code: MODE_CONFIG,
        value: [mode],
      });
      await models.Configs.createOrUpdateConfig({
        code: GROUPS_CONFIG,
        value: [...new Set(permissionGroupIds)],
      });

      return models.TwoFactors.getPolicy();
    }

    public static async isRequiredFor(user: IUserDocument) {
      const { mode, permissionGroupIds } = await models.TwoFactors.getPolicy();

      if (mode !== 'required') {
        return false;
      }

      return (
        !permissionGroupIds.length ||
        (user.permissionGroupIds || []).some((id) =>
          permissionGroupIds.includes(id),
        )
      );
    }

    /** What sign-in still needs after the first factor passed. */
    public static async requirement(
      user: IUserDocument,
    ): Promise<TwoFactorRequirement> {
      const { mode } = await models.TwoFactors.getPolicy();

      // Off means off: enrolled members are not asked either
      if (mode === 'off') {
        return 'none';
      }

      if (await findConfirmed(user._id)) {
        return 'verify';
      }

      return (await models.TwoFactors.isRequiredFor(user)) ? 'setup' : 'none';
    }

    public static async status(user: IUserDocument) {
      const doc = await findConfirmed(user._id);
      const { mode } = await models.TwoFactors.getPolicy();

      return {
        available: mode !== 'off',
        enabled: Boolean(doc),
        required: await models.TwoFactors.isRequiredFor(user),
        recoveryCodesLeft: doc?.recoveryCodeHashes.length ?? 0,
      };
    }

    /** Starts (or restarts) setup; the secret is shown once to scan. */
    public static async beginSetup(user: IUserDocument) {
      if (await findConfirmed(user._id)) {
        throw new Error('Two-factor authentication is already on');
      }

      if ((await models.TwoFactors.getPolicy()).mode === 'off') {
        throw new Error(
          'Two-factor authentication is turned off for this organization',
        );
      }

      const secret = newTotpSecret();

      await models.TwoFactors.updateOne(
        { userId: user._id },
        {
          $set: {
            secret: sealSecret(secret),
            recoveryCodeHashes: [],
            lastUsedStep: -1,
          },
          $unset: { confirmedAt: '' },
        },
        { upsert: true },
      );

      const issuer = getEnv({ name: 'TWO_FACTOR_ISSUER' }) || 'erxes';

      return {
        secret,
        otpauthUrl: otpauthUrl(
          secret,
          user.email || user.username || '',
          issuer,
        ),
      };
    }

    /**
     * The first good code turns 2FA on and returns the recovery codes, once.
     * Null for a wrong code, so callers can count the failure.
     */
    public static async confirmSetup(userId: string, code: string) {
      const pending = await models.TwoFactors.findOne({
        userId,
        confirmedAt: { $exists: false },
      });
      const secret = pending ? openSecret(pending.secret) : null;
      const step = secret ? verifyTotp(secret, code) : null;

      if (!pending || step === null) {
        return null;
      }

      const recoveryCodes = newRecoveryCodes();

      await models.TwoFactors.updateOne(
        { _id: pending._id },
        {
          $set: {
            confirmedAt: new Date(),
            lastUsedStep: step,
            recoveryCodeHashes: recoveryCodes.map(hashRecoveryCode),
          },
        },
      );

      return recoveryCodes;
    }

    /** An authenticator code, or a recovery code that is then used up. */
    public static async verifyCode(userId: string, code: string) {
      const doc = await findConfirmed(userId);

      if (!doc) {
        return false;
      }

      const secret = openSecret(doc.secret);
      const step = secret ? verifyTotp(secret, code, doc.lastUsedStep) : null;

      if (step !== null) {
        // Conditional write: two requests racing with one code cannot both pass
        const { modifiedCount } = await models.TwoFactors.updateOne(
          { _id: doc._id, lastUsedStep: { $lt: step } },
          { $set: { lastUsedStep: step } },
        );

        return modifiedCount === 1;
      }

      const { modifiedCount } = await models.TwoFactors.updateOne(
        { _id: doc._id, recoveryCodeHashes: hashRecoveryCode(code) },
        { $pull: { recoveryCodeHashes: hashRecoveryCode(code) } },
      );

      return modifiedCount === 1;
    }

    public static async disable(user: IUserDocument, code: string) {
      if (await models.TwoFactors.isRequiredFor(user)) {
        throw new Error(
          'Two-factor authentication is required for your account',
        );
      }

      if (!(await models.TwoFactors.verifyCode(user._id, code))) {
        throw invalidCode();
      }

      await models.TwoFactors.deleteOne({ userId: user._id });

      return true;
    }

    public static async regenerateRecoveryCodes(userId: string, code: string) {
      if (!(await models.TwoFactors.verifyCode(userId, code))) {
        throw invalidCode();
      }

      const recoveryCodes = newRecoveryCodes();

      await models.TwoFactors.updateOne(
        { userId },
        { $set: { recoveryCodeHashes: recoveryCodes.map(hashRecoveryCode) } },
      );

      return recoveryCodes;
    }

    /** Admin recovery for a lost phone: 2FA is cleared and every session ends. */
    public static async reset(userId: string) {
      await models.TwoFactors.deleteOne({ userId });
      await revokeUserSessions(subdomain, userId);

      return true;
    }
  }

  twoFactorSchema.loadClass(TwoFactor);

  return twoFactorSchema;
};
