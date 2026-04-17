import { WorkOS } from '@workos-inc/node';
import {
  authCookieOptions,
  getEnv,
  logHandler,
  markResolvers,
  redis,
  updateSaasOrganization,
} from 'erxes-api-shared/utils';
import * as jwt from 'jsonwebtoken';
import { IContext } from '~/connectionResolvers';
import {
  getCallbackRedirectUrl,
  isValidEmail,
  sendSaasMagicLinkEmail,
} from '~/modules/auth/utils';
import { assertSaasEnvironment } from '~/utils/saas';

type LoginParams = {
  email: string;
  password: string;
  deviceToken?: string;
};

const ACCESS_TOKEN_EXPIRES_IN = 24 * 60 * 60;
const APP_TOKEN_HEADERS = ['erxes-app-token', 'x-app-api-token'];
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'erxes-app-token',
  'x-app-api-token',
];

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getHeaderValue = (headers: any, name: string) => {
  const value = headers?.[name];

  if (Array.isArray(value)) {
    throw new Error(`Multiple ${name} headers`);
  }

  return (value || '').toString().trim();
};

const getAppTokenFromHeaders = (headers: any) => {
  for (const header of APP_TOKEN_HEADERS) {
    const token = getHeaderValue(headers, header);

    if (token) {
      return token;
    }
  }

  return '';
};

const sanitizeHeaders = (headers: any) => {
  const sanitized = { ...(headers || {}) };

  for (const header of SENSITIVE_HEADERS) {
    if (sanitized[header]) {
      sanitized[header] = '[redacted]';
    }
  }

  return sanitized;
};

const findLoginUser = async (models: IContext['models'], email: string) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const escapedEmail = escapeRegExp(normalizedEmail);

  return models.Users.findOne({
    $or: [
      { email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } },
      { username: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } },
    ],
    isActive: true,
  });
};

const ensureActiveAppToken = async ({
  req,
  models,
  subdomain,
}: Pick<IContext, 'req' | 'models' | 'subdomain'>) => {
  const appToken = getAppTokenFromHeaders(req.headers);

  if (!appToken) {
    throw new Error('Missing erxes app token');
  }
  console.log({ appToken });
  const cacheKey = `app_token:${subdomain}:${appToken}`;
  let isValid = await redis.get(cacheKey);

  if (isValid === null) {
    const appInDb = await models.Apps.findOne({
      token: appToken,
      status: 'active',
    });

    isValid = appInDb ? '1' : '0';
    await redis.set(cacheKey, isValid, 'EX', 3600);
  }

  if (isValid !== '1') {
    throw new Error('Invalid app token');
  }

  const app = await models.Apps.findOneAndUpdate(
    { token: appToken, status: 'active' },
    { $set: { lastUsedAt: new Date() } },
    { new: true },
  );

  if (!app) {
    await redis.del(cacheKey);
    throw new Error('Invalid app token');
  }

  return app;
};

const buildAuthTokenResponse = async (
  models: IContext['models'],
  token: string,
  refreshToken: string,
  user: any,
) => {
  return {
    tokenType: 'Bearer',
    accessToken: token,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    user: user ? await models.Users.getTokenFields(user) : null,
  };
};

export const authMutations = {
  /*
   * Login   */
  async login(
    _parent: undefined,
    args: LoginParams,
    { req, res, requestInfo, models, subdomain }: IContext,
  ) {
    return await logHandler(
      async () => {
        const response = await models.Users.login(args);

        const { token } = response;

        const sameSite = getEnv({ name: 'SAME_SITE' });
        const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

        const cookieOptions: any = { secure: requestInfo.secure };
        if (
          sameSite &&
          sameSite === 'none' &&
          res.req.headers.origin !== DOMAIN
        ) {
          cookieOptions.sameSite = sameSite;
        }

        res.cookie('auth-token', token, authCookieOptions(cookieOptions));

        return 'loggedIn';
      },
      {
        subdomain,
        source: 'auth',
        action: 'login',
        userId: (await models.Users.findOne({ email: args.email }).lean())?._id,
        payload: {
          headers: req.headers,
          email: args?.email,
          method: 'email/password',
        },
      },
      null,
      null,
      true,
    );
  },

  async loginWithAppToken(
    _parent: undefined,
    args: LoginParams,
    { req, models, subdomain }: IContext,
  ) {
    const app = await ensureActiveAppToken({ req, models, subdomain });
    const userForLog = await findLoginUser(models, args.email);

    return await logHandler(
      async () => {
        const response = await models.Users.login(args);
        const user = await findLoginUser(models, args.email);

        if (!user) {
          throw new Error('Invalid login');
        }

        return buildAuthTokenResponse(
          models,
          response.token,
          response.refreshToken,
          user,
        );
      },
      {
        subdomain,
        source: 'auth',
        action: 'loginWithAppToken',
        userId: userForLog?._id,
        payload: {
          headers: sanitizeHeaders(req.headers),
          email: args?.email,
          method: 'app-token/email/password',
          appId: app?._id,
          appName: app?.name,
        },
      },
      null,
      null,
      true,
    );
  },

  async refreshAppToken(
    _parent: undefined,
    { refreshToken }: { refreshToken: string },
    { req, models, subdomain }: IContext,
  ) {
    const app = await ensureActiveAppToken({ req, models, subdomain });
    let userId: string | undefined;

    try {
      const decoded: any = jwt.verify(refreshToken, models.Users.getSecret());
      userId = decoded?.user?._id;
    } catch {
      userId = undefined;
    }

    return await logHandler(
      async () => {
        const response = await models.Users.refreshTokens(refreshToken);

        if (!response?.token || !response?.refreshToken || !response?.user) {
          throw new Error('Invalid refresh token');
        }

        return buildAuthTokenResponse(
          models,
          response.token,
          response.refreshToken,
          response.user,
        );
      },
      {
        subdomain,
        source: 'auth',
        action: 'refreshAppToken',
        userId,
        payload: {
          headers: sanitizeHeaders(req.headers),
          method: 'app-token/refresh-token',
          appId: app?._id,
          appName: app?.name,
        },
      },
      null,
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
        const logout = await models.Users.logout(
          user,
          requestInfo.cookies['auth-token'],
        );
        res.clearCookie('auth-token');
        return logout;
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
    { subdomain, models }: IContext,
  ) {
    const token = await models.Users.forgotPassword(email);

    // send email ==============
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    const link = `${DOMAIN}/reset-password?token=${token}`;

    // await utils.sendEmail(
    //   subdomain,
    //   {
    //     toEmails: [email],
    //     title: 'Reset password',
    //     template: {
    //       name: 'resetPassword',
    //       data: {
    //         content: link,
    //       },
    //     },
    //   },
    //   models
    // );

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

    const token = await jwt.sign(
      {
        user: await models.Users.getTokenFields(user),
        subdomain,
        redirectUri: getCallbackRedirectUrl(subdomain, 'ml-callback'),
      },
      models.Users.getSecret(),
      { expiresIn: '1d' },
    );

    // validated tokens are checked at user middleware
    await models.Users.updateOne(
      { _id: user._id },
      { $push: { validatedTokens: token } },
    );

    // will use subdomain when workos callback data arrives
    await redis.set('subdomain', subdomain);

    const session = await workosClient.passwordless.createSession({
      email,
      type: 'MagicLink',
      state: token,
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

markResolvers(authMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
