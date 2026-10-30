import { WorkOS } from '@workos-inc/node';
import {
  getEnv,
  getSubdomain,
  redis,
  USER_ROLES,
} from 'erxes-api-shared/utils';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateModels } from '~/connectionResolvers';
import { startSession } from '~/modules/auth/session';
import { sendOnboardNotification } from '~/modules/notifications/utils';

export const MAGIC_LINK_STATE = 'magic_link_state';

interface IMagicLinkState {
  typ: string;
  jti: string;
  userId: string;
  subdomain: string;
}

export const ssocallback = async (req: any, res) => {
  const { code = '', subdomain = '' } = req.query;

  const workosClient = new WorkOS(getEnv({ name: 'WORKOS_API_KEY' }));

  try {
    const sub = subdomain || getSubdomain(req);
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

    await startSession({
      models,
      subdomain: sub,
      userId: user._id,
      method: 'sso',
      req,
      res,
    });

    await sendOnboardNotification(sub, models, user._id);

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
    const stateStr = typeof state === 'string' ? state : '';
    if (!stateStr) {
      return res.redirect('/login');
    }

    // State is signed by loginWithMagicLink and names its own tenant
    const { typ, jti, userId, subdomain } = jwt.verify(
      stateStr,
      process.env.JWT_TOKEN_SECRET || 'SECRET',
    ) as IMagicLinkState;

    if (typ !== MAGIC_LINK_STATE || !jti || !userId || !subdomain) {
      return res.redirect('/login');
    }

    // One sign-in per link, so a leaked or forwarded link cannot be replayed
    const firstUse = await redis.set(
      `magic_link_used:${jti}`,
      1,
      'EX',
      24 * 60 * 60,
      'NX',
    );

    if (!firstUse) {
      return res.redirect('/login');
    }

    const models = await generateModels(subdomain);
    const user = await models.Users.findOne({ _id: userId, isActive: true });

    if (!user) {
      return res.redirect('/login');
    }

    await startSession({
      models,
      subdomain,
      userId: user._id,
      method: 'magic_link',
      req,
      res,
    });

    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const NODE_ENV = getEnv({ name: 'NODE_ENV', subdomain });
    const isProduction = NODE_ENV === 'production';

    await sendOnboardNotification(subdomain, models, user._id);

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
      await sendOnboardNotification(subdomain, models, systemUser._id);

      await startSession({
        models,
        subdomain,
        userId: systemUser._id,
        method: 'saas_handoff',
        req,
        res,
      });
    }

    return res.redirect(`https://${subdomain}.next.erxes.io`);
  } catch (e) {
    console.error(e.message);
    return res.redirect(`https://${subdomain}.next.erxes.io`);
  }
};
