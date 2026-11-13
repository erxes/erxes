import { WorkOS } from '@workos-inc/node';
import { randomUUID } from 'crypto';
import {
  getEnv,
  escapeRegExp,
  logHandler,
  markResolvers,
  updateSaasOrganization,
} from 'erxes-api-shared/utils';
import * as jwt from 'jsonwebtoken';
import { IContext, IModels } from '~/connectionResolvers';
import { checkRateLimit } from '~/modules/auth/routes/oauth/utils';
import { LoginError } from '~/modules/auth/loginError';
import { afterStaffLogin, staffPasswordLogin } from '~/modules/auth/staffLogin';
import { endSession, startSession } from '~/modules/auth/session';
import {
  getCallbackRedirectUrl,
  getRequestIp,
  isValidEmail,
  sendSaasMagicLinkEmail,
} from '~/modules/auth/utils';
import { assertSaasEnvironment, MAGIC_LINK_STATE } from '~/utils/saas';
import { sendEmail } from '~/utils/email';

type LoginParams = {
  email: string;
  password: string;
  deviceToken?: string;
};

// Matches Users.login so attempts by username reach the user's log too
const findLoginUser = (models: IModels, identifier: string) => {
  const pattern = new RegExp(
    `^${escapeRegExp((identifier || '').trim())}$`,
    'i',
  );

  return models.Users.findOne(
    { $or: [{ email: pattern }, { username: pattern }] },
    { _id: 1 },
  ).lean();
};

export const authMutations = {
  /*
   * Login   */
  async login(
    _parent: undefined,
    args: LoginParams,
    { req, res, models, subdomain }: IContext,
  ) {
    // Filled once the method is known; logHandler merges it on success
    const loginResult: { method?: string } = {};

    return await logHandler(
      async () => {
        const result = await staffPasswordLogin({
          models,
          subdomain,
          ip: getRequestIp(req),
          email: args.email,
          password: args.password,
          deviceToken: args.deviceToken,
        });

        if (result.status !== 'loggedIn') {
          // An error, so a client unaware of 2FA can never look signed in
          throw new LoginError(result.status, result.challenge);
        }

        const { user, method } = result;
        loginResult.method = method;

        await startSession({
          models,
          subdomain,
          userId: user._id,
          method,
          req,
          res,
        });

        await afterStaffLogin(models, subdomain, method);

        return 'loggedIn';
      },
      {
        subdomain,
        source: 'auth',
        action: 'login',
        userId: (await findLoginUser(models, args.email))?._id,
        payload: {
          headers: req.headers,
          email: args?.email,
        },
      },
      loginResult,
      null,
      true,
    );
  },

  /*
   * logout
   */
  async logout(
    _parent: undefined,
    _args: undefined,
    { req, res, user, requestInfo, models, subdomain }: IContext,
  ) {
    await logHandler(
      async () => {
        await endSession({ subdomain, req, res });

        const legacyToken = requestInfo.cookies['auth-token'];

        if (legacyToken) {
          res.clearCookie('auth-token');
        }

        return models.Users.logout(user, legacyToken);
      },
      {
        subdomain,
        source: 'auth',
        action: 'logout',
        userId: user._id,
        payload: { headers: req.headers, email: user?.email },
      },
    );
  },

  /*
   * Send forgot password email
   */
  async forgotPassword(
    _parent: undefined,
    { email }: { email: string },
    { subdomain, models, req }: IContext,
  ) {
    const normalizedEmail = (email || '').toLowerCase().trim();

    await checkRateLimit(
      `auth:forgot:ip:${subdomain}:${getRequestIp(req)}`,
      5,
      15 * 60,
    );
    await checkRateLimit(
      `auth:forgot:email:${subdomain}:${normalizedEmail}`,
      3,
      60 * 60,
    );

    const token = await models.Users.forgotPassword(email);

    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    const link = `${DOMAIN}/reset-password?token=${token}`;

    await sendEmail(
      subdomain,
      {
        toEmails: [email],
        title: 'Reset password',
        template: {
          name: 'resetPassword',
          data: {
            content: link,
          },
        },
      },
      models,
    );

    return 'sent';
  },

  /*
   * Reset password
   */
  async resetPassword(
    _parent: undefined,
    args: { token: string; newPassword: string },
    { models }: IContext,
  ) {
    return models.Users.resetPassword(args);
  },

  async loginWithGoogle(
    _parent: undefined,
    _params: undefined,
    { models, subdomain }: IContext,
  ) {
    assertSaasEnvironment();
    const WORKOS_API_KEY = getEnv({ name: 'WORKOS_API_KEY', subdomain });
    const CORE_DOMAIN = getEnv({ name: 'CORE_DOMAIN', subdomain });

    const workosClient = new WorkOS(WORKOS_API_KEY);

    const state = await jwt.sign(
      {
        subdomain,
        redirectUri: getCallbackRedirectUrl(subdomain, 'sso-callback'),
      },
      models.Users.getSecret(),
      { expiresIn: '1d' },
    );

    const authorizationURL = workosClient.sso.getAuthorizationUrl({
      provider: 'GoogleOAuth',
      redirectUri: `${CORE_DOMAIN}/saas-sso-callback`,

      clientId: getEnv({ name: 'WORKOS_PROJECT_ID', subdomain }),
      state,
    });

    await updateSaasOrganization(subdomain, {
      lastActiveDate: Date.now(),
    });

    return authorizationURL;
  },

  async loginWithMagicLink(
    _,
    { email }: { email: string },
    { models, subdomain }: IContext,
  ) {
    assertSaasEnvironment();

    const WORKOS_API_KEY = getEnv({ name: 'WORKOS_API_KEY', subdomain });
    const CORE_DOMAIN = getEnv({ name: 'CORE_DOMAIN', subdomain });
    const workosClient = new WorkOS(WORKOS_API_KEY);

    if (!isValidEmail(email)) {
      throw new Error(
        'Invalid email address provided. Please enter a valid email.',
      );
    }

    const user = await models.Users.findOne({
      email,
    });

    if (!user) {
      return 'Invalid login';
    }

    // Only proves the link was issued; the callback starts the real session
    const state = await jwt.sign(
      {
        typ: MAGIC_LINK_STATE,
        jti: randomUUID(),
        userId: user._id,
        subdomain,
        redirectUri: getCallbackRedirectUrl(subdomain, 'ml-callback'),
      },
      models.Users.getSecret(),
      { expiresIn: '1d' },
    );

    const session = await workosClient.passwordless.createSession({
      email,
      type: 'MagicLink',
      state,
      redirectURI: `${CORE_DOMAIN}/saas-ml-callback`,
    });

    await sendSaasMagicLinkEmail({
      subdomain,
      models,
      toEmail: email,
      link: session.link,
    });

    await updateSaasOrganization(subdomain, {
      lastActiveDate: Date.now(),
    });

    return 'success';
  },
};

markResolvers<IContext>(authMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
