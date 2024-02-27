import Workos from '@workos-inc/node';
import * as jwt from 'jsonwebtoken';

import { getEnv, saveValidatedToken } from './data/utils';

import { debugBase, debugError } from './debuggers';

import { generateModels } from './connectionResolver';
import { authCookieOptions, getSubdomain } from '@erxes/api-utils/src/core';
import { USER_ROLES } from '@erxes/api-utils/src/constants';
import { getOrganizationDetail } from '@erxes/api-utils/src/saas/saas';
import redis from '@erxes/api-utils/src/redis';

const setCookie = async (res, user, subdomain: string, token: string) => {
  await saveValidatedToken(token, user);

  const models = await generateModels(subdomain);
  const organization = await getOrganizationDetail({ subdomain, models });

  const cookieOptions: any = authCookieOptions();

  if (organization.domain && organization.dnsStatus === 'active') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }

  res.cookie('auth-token', token, cookieOptions);
};

export const handleMagiclink = async (req: any, res) => {
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
    return res.redirect('/sign-in-with-email');
  }

  try {
    // this was set in loginWithMagicLink mutation
    const subdomain = (await redis.get('subdomain')) || '';

    await redis.set('subdomain', '');

    const models = await generateModels(subdomain);
    const { user }: any = jwt.verify(state, models.Users.getSecret());

    await setCookie(res, user, subdomain, state.toString());

    return res.redirect(`https://${subdomain}.app.erxes.io`);
  } catch (e) {
    debugBase(e.message);

    return res.end(e.message);
  }
};

export const handleCoreLogin = async (req: any, res) => {
  const { token } = req.query;
  const subdomain = getSubdomain(req);

  // already signed in
  if (req.user) {
    return res.redirect('/');
  }

  if (!token) {
    return res.redirect('/');
  }

  const models = await generateModels(subdomain);

  try {
    const { user }: any = jwt.verify(token, models.Users.getSecret());

    const systemUser = await models.Users.findOne({
      email: user.email,
      isActive: true,
      isOwner: true,
    });

    if (systemUser) {
      const [createToken] = await models.Users.createTokens(
        systemUser,
        models.Users.getSecret(),
      );

      await setCookie(res, systemUser, subdomain, createToken.toString());
    }

    return res.redirect(`https://${subdomain}.app.erxes.io`);
  } catch (e) {
    debugBase(e.message);

    return res.redirect(`https://${subdomain}.app.erxes.io`);
  }
};

export const ssocallback = async (req: any, res) => {
  const { code = '', subdomain = '' } = req.query;

  const workosClient = new Workos(getEnv({ name: 'WORKOS_API_KEY' }));

  try {
    const sub = subdomain || (await getSubdomain(req));
    const models = await generateModels(sub);
    const FRONT_DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const { profile } = await workosClient.sso.getProfileAndToken({
      code: code.toString(),
      clientID: getEnv({ name: 'WORKOS_PROJECT_ID' }),
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
      return res.redirect(FRONT_DOMAIN);
    }

    const [token] = await models.Users.createTokens(
      user,
      models.Users.getSecret(),
    );

    await setCookie(res, user, subdomain, token.toString());

    return res.redirect(FRONT_DOMAIN);
  } catch (e) {
    debugError(`Error occurred when logging in via google: "${e.message}"`);
    throw new Error(e);
  }
};
