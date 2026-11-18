import { logHandler, markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITwoFactorPolicy } from '@/auth/db/definitions/twoFactor';
import { LoginError } from '@/auth/loginError';
import { startSession } from '@/auth/session';
import { afterStaffLogin, staffTwoFactorLogin } from '@/auth/staffLogin';
import { readTwoFactorChallenge } from '@/auth/twoFactor/challenge';
import { getRequestIp } from '@/auth/utils';
import { validatePermissionGroupIds } from '@/organization/team-member/graphql/mutations';

const POLICY_PERMISSION = 'permissionsManage';

const invalidCode = () => new Error('Invalid two-factor code');

/** Second sign-in step: public, bound to the challenge from login. */
export const twoFactorLoginMutations = {
  async loginTwoFactorSetup(
    _parent: undefined,
    { challenge }: { challenge: string },
    { models, subdomain }: IContext,
  ) {
    const pending = await readTwoFactorChallenge(subdomain, challenge);

    if (!pending?.setup) {
      throw new LoginError('two_factor_expired');
    }

    return models.TwoFactors.beginSetup(
      await models.Users.getUser(pending.userId),
    );
  },

  /** Returns recovery codes when this code finished setup, otherwise none. */
  async loginTwoFactorVerify(
    _parent: undefined,
    { challenge, code }: { challenge: string; code: string },
    { models, subdomain, req, res }: IContext,
  ) {
    const pending = await readTwoFactorChallenge(subdomain, challenge);

    if (!pending) {
      throw new LoginError('two_factor_expired');
    }

    return logHandler(
      async () => {
        const { user, method, recoveryCodes } = await staffTwoFactorLogin({
          models,
          subdomain,
          ip: getRequestIp(req),
          challenge,
          code,
        });

        await startSession({
          models,
          subdomain,
          userId: user._id,
          method,
          req,
          res,
        });

        await afterStaffLogin(models, subdomain, method);

        return recoveryCodes;
      },
      {
        subdomain,
        source: 'auth',
        action: 'login',
        userId: pending.userId,
        payload: {
          headers: req.headers,
          method: pending.method,
          twoFactor: true,
        },
      },
      null,
      null,
      true,
    );
  },
};

markResolvers<IContext>(twoFactorLoginMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export const twoFactorQueries = {
  async authTwoFactorStatus(
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    return models.TwoFactors.status(user);
  },

  async authTwoFactorPolicy(
    _parent: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(POLICY_PERMISSION);

    return models.TwoFactors.getPolicy();
  },
};

export const twoFactorMutations = {
  async authTwoFactorSetup(
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    return models.TwoFactors.beginSetup(user);
  },

  async authTwoFactorEnable(
    _parent: undefined,
    { code }: { code: string },
    { models, user }: IContext,
  ) {
    const recoveryCodes = await models.TwoFactors.confirmSetup(user._id, code);

    if (!recoveryCodes) {
      throw invalidCode();
    }

    return recoveryCodes;
  },

  async authTwoFactorDisable(
    _parent: undefined,
    { code }: { code: string },
    { models, user }: IContext,
  ) {
    return models.TwoFactors.disable(user, code);
  },

  async authTwoFactorRecoveryCodes(
    _parent: undefined,
    { code }: { code: string },
    { models, user }: IContext,
  ) {
    return models.TwoFactors.regenerateRecoveryCodes(user._id, code);
  },

  async authTwoFactorReset(
    _parent: undefined,
    { userId }: { userId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersResetPassword');

    return models.TwoFactors.reset(userId);
  },

  async authTwoFactorPolicySave(
    _parent: undefined,
    policy: ITwoFactorPolicy,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(POLICY_PERMISSION);

    if (policy.permissionGroupIds.length) {
      await validatePermissionGroupIds(models, policy.permissionGroupIds);
    }

    return models.TwoFactors.savePolicy(policy);
  },
};
