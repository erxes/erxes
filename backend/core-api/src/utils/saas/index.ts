import { WorkOS } from '@workos-inc/node';
import {
  authCookieOptions,
  getEnv,
  getSaasOrganizationDetail,
  getSubdomain,
  redis,
  USER_ROLES,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { saveValidatedToken } from '~/modules/auth/utils';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
const setCookie = async (
  res: Response,
  user: any,
  subdomain: string,
  token: string,
) => {
  await saveValidatedToken(token, user);

  const models = await generateModels(subdomain);
  const organization = await getSaasOrganizationDetail({ subdomain, models });

  const cookieOptions: any = authCookieOptions();

  if (organization.domain && organization.dnsStatus === 'active') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }

  res.cookie('auth-token', token, cookieOptions);
};

export const ssocallback = async (req: any, res) => {
  const { code = '', subdomain = '' } = req.query;

  const workosClient = new WorkOS(getEnv({ name: 'WORKOS_API_KEY' }));

  try {
    const sub = subdomain || (await getSubdomain(req));
    const models = await generateModels(sub);
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const { profile } = await workosClient.sso.getProfileAndToken({
      code: code.toString(),
      clientId: getEnv({ name: 'WORKOS_PROJECT_ID' }),
    });

    if (!profile) {
      throw new Error('Google profile not found');
    }

    const { email = '' } = profile;

    const user = await models.Users.findOne({
      email,
      isActive: true,
      role: { $ne: USER_ROLES.SYSTEM },
    });

    if (!user) {
      return res.redirect(DOMAIN);
    }

    const [token] = await models.Users.createTokens(
      user,
      models.Users.getSecret(),
    );

    await setCookie(res, user, subdomain, token.toString());

    return res.redirect(DOMAIN);
  } catch (e) {
    console.error(`Error occurred when logging in via google: "${e.message}"`);
    throw new Error(e);
  }
};

// Extend Request type to include 'user' property
interface RequestWithUser extends Request {
  user?: any;
}

export const magiclinkCallback = async (
  req: RequestWithUser,
  res: Response,
) => {
  const { error, error_description, state } = req.query;

  // already signed in
  if (req.user) {
    return res.redirect('/');
  }

  const hasError = error && !(error === 'undefined' || error === 'null');
  const hasErrorDescription =
    error_description &&
    !(error_description === 'undefined' || error_description === 'null');

  if (hasError || hasErrorDescription) {
    return res.redirect('/login');
  }

  try {
    // this was set in loginWithMagicLink mutation
    const subdomain = (await redis.get('subdomain')) || '';

    await redis.set('subdomain', '');

    const models = await generateModels(subdomain);
    const stateStr = typeof state === 'string' ? state : '';
    if (!stateStr) {
      return res.redirect('/login');
    }
    const { user }: any = jwt.verify(stateStr, models.Users.getSecret());

    await setCookie(res, user, subdomain, stateStr);

    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const NODE_ENV = getEnv({ name: 'NODE_ENV', subdomain });
    const isProduction = NODE_ENV === 'production';

    return res.redirect(isProduction ? DOMAIN : 'http://localhost:3001');
  } catch (e: any) {
    console.error(e.message);

    return res.end(e.message);
  }
};

export const assertSaasEnvironment = () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION !== 'saas') {
    throw new Error('This operation is only allowed in saas version.');
  }
};
