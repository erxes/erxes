import { IModels } from '~/connectionResolvers';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { armLdapRecheck } from '@/auth/ldap/worker';
import { LoginError } from '@/auth/loginError';
import { SessionMethod } from '@/auth/session';
import {
  createTwoFactorChallenge,
  endTwoFactorChallenge,
  failTwoFactorChallenge,
  readTwoFactorChallenge,
} from '@/auth/twoFactor/challenge';
import {
  assertLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from '@/auth/utils';

/**
 * The one staff sign-in sequence (lockout, password or directory, two-factor),
 * shared by the GraphQL `login` mutation and the OAuth sign-in page. Callers
 * start the session themselves once a user is returned.
 */
export type StaffLoginResult =
  | { status: 'loggedIn'; user: IUserDocument; method: SessionMethod }
  | {
      status: 'two_factor_required' | 'two_factor_setup_required';
      challenge: string;
    };

export const staffPasswordLogin = async ({
  models,
  subdomain,
  ip,
  email,
  password,
  deviceToken,
}: {
  models: IModels;
  subdomain: string;
  ip: string;
  email: string;
  password: string;
  deviceToken?: string;
}): Promise<StaffLoginResult> => {
  await assertLoginAllowed(subdomain, ip, email);

  let response: Awaited<ReturnType<typeof models.Users.login>>;

  try {
    response = await models.Users.login({ email, password, deviceToken });
  } catch (e) {
    // An unreachable directory is not the user's mistake, so it must not lock them out
    if (!(e instanceof LoginError && e.reason === 'directory_unreachable')) {
      await recordLoginFailure(subdomain, email);
    }
    throw e;
  }

  await clearLoginFailures(subdomain, email);

  const { user, method } = response;
  const twoFactor = await models.TwoFactors.requirement(user);

  if (twoFactor !== 'none') {
    const challenge = await createTwoFactorChallenge(subdomain, {
      userId: user._id,
      method,
      setup: twoFactor === 'setup',
    });

    return {
      status:
        twoFactor === 'setup'
          ? 'two_factor_setup_required'
          : 'two_factor_required',
      challenge,
    };
  }

  return { status: 'loggedIn', user, method };
};

// Wrong codes count against the account, not the challenge, so new sign-ins
// cannot reset the budget for guessing
export const twoFactorLimitKey = (userId: string) => `2fa:${userId}`;

/** Second step: the code for a challenge from `staffPasswordLogin`. */
export const staffTwoFactorLogin = async ({
  models,
  subdomain,
  ip,
  challenge,
  code,
}: {
  models: IModels;
  subdomain: string;
  ip: string;
  challenge: string;
  code: string;
}): Promise<{
  user: IUserDocument;
  method: SessionMethod;
  recoveryCodes: string[];
}> => {
  const pending = await readTwoFactorChallenge(subdomain, challenge);

  if (!pending) {
    throw new LoginError('two_factor_expired');
  }

  const limitKey = twoFactorLimitKey(pending.userId);

  await assertLoginAllowed(subdomain, ip, limitKey);

  const user = await models.Users.findOne({
    _id: pending.userId,
    isActive: true,
  });

  if (!user) {
    await endTwoFactorChallenge(subdomain, challenge);
    throw new LoginError('two_factor_expired');
  }

  const recoveryCodes = pending.setup
    ? await models.TwoFactors.confirmSetup(user._id, code)
    : (await models.TwoFactors.verifyCode(user._id, code)) && [];

  if (!recoveryCodes) {
    await failTwoFactorChallenge(subdomain, challenge, pending);
    await recordLoginFailure(subdomain, limitKey);
    throw new LoginError('two_factor_invalid');
  }

  await endTwoFactorChallenge(subdomain, challenge);
  await clearLoginFailures(subdomain, limitKey);

  return { user, method: pending.method, recoveryCodes };
};

/** Re-arms the directory recheck after a restart; never blocks sign-in. */
export const afterStaffLogin = async (
  models: IModels,
  subdomain: string,
  method: SessionMethod,
) => {
  if (method === 'ldap') {
    await armLdapRecheck(models, subdomain).catch((e: Error) =>
      console.error(`LDAP recheck scheduling failed: ${e.message}`),
    );
  }
};
