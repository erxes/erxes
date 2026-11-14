import { createHash } from 'crypto';
import { getSubdomain, logHandler, redis } from 'erxes-api-shared/utils';
import { Request, Response, Router } from 'express';
import { generateModels, IModels } from '~/connectionResolvers';
import { LoginError } from '@/auth/loginError';
import {
  readActiveSession,
  readSessionCookie,
  startSession,
} from '@/auth/session';
import {
  afterStaffLogin,
  StaffLoginResult,
  staffPasswordLogin,
  staffTwoFactorLogin,
} from '@/auth/staffLogin';
import { getRequestIp } from '@/auth/utils';
import {
  renderLoginPage,
  renderMessagePage,
  renderTwoFactorPage,
} from './authorizePage';
import { findOAuthClient } from './platformClients';
import { getJwks } from './productTokens';
import {
  checkRateLimit,
  createRandomToken,
  hashToken,
  isRateLimitError,
} from './utils';

/**
 * "Sign in with erxes" for products: OAuth 2.0 authorization code flow with
 * PKCE (S256 only). Reached directly on core-api as well as through the
 * gateway, so these routes trust only the core session cookie, never the
 * gateway `user` header.
 */
export const authorizeRouter: Router = Router();

const REQUEST_SECS = 10 * 60;
const CODE_SECS = 60;
const REQUEST_COOKIE = 'erxes-oauth-request';

export interface PendingAuthorization {
  clientId: string;
  clientName: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
  scope?: string;
}

export interface AuthorizationCode extends PendingAuthorization {
  userId: string;
  subdomain: string;
}

const requestKey = (subdomain: string, id: string) =>
  `oauth:authorize:${subdomain}:${id}`;
export const codeKey = (subdomain: string, code: string) =>
  `oauth:code:${subdomain}:${hashToken(code)}`;

const PKCE_VALUE = /^[A-Za-z0-9\-._~]{43,128}$/;

/** RFC 7636 S256: BASE64URL(SHA256(verifier)) equals the challenge. */
export const pkceMatches = (verifier: string, challenge: string) =>
  PKCE_VALUE.test(verifier) &&
  createHash('sha256').update(verifier).digest('base64url') === challenge;

const field = (value: unknown, max = 2048) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const loadRequest = async (
  req: Request,
  subdomain: string,
): Promise<{ id: string; pending: PendingAuthorization } | null> => {
  const id = field(req.body?.request, 100);

  // Bound to this browser: the id in the form must match its cookie
  if (!id || req.cookies?.[REQUEST_COOKIE] !== id) {
    return null;
  }

  const raw = await redis.get(requestKey(subdomain, id));

  return raw ? { id, pending: JSON.parse(raw) as PendingAuthorization } : null;
};

const expired = (res: Response) =>
  renderMessagePage(res, {
    status: 400,
    title: 'Sign-in expired',
    message: 'Go back to the app and choose “Sign in with erxes” again.',
  });

/** Hands the browser back to the product with a one-time code. */
const issueCode = async (
  res: Response,
  subdomain: string,
  requestId: string | null,
  pending: PendingAuthorization,
  userId: string,
) => {
  const code = createRandomToken(32);
  const stored: AuthorizationCode = { ...pending, userId, subdomain };

  await redis.set(
    codeKey(subdomain, code),
    JSON.stringify(stored),
    'EX',
    CODE_SECS,
  );

  if (requestId) {
    await redis.del(requestKey(subdomain, requestId));
    res.clearCookie(REQUEST_COOKIE, { path: '/' });
  }

  const target = new URL(pending.redirectUri);

  target.searchParams.set('code', code);

  if (pending.state) {
    target.searchParams.set('state', pending.state);
  }

  return res.redirect(303, target.toString());
};

const signedInUserId = async (
  models: IModels,
  subdomain: string,
  req: Request,
) => {
  const session = await readActiveSession(
    subdomain,
    readSessionCookie(req.cookies),
  );

  if (!session) {
    return null;
  }

  const user = await models.Users.findOne(
    { _id: session.userId, isActive: true },
    { _id: 1 },
  ).lean();

  return user ? String(user._id) : null;
};

const refuseSupportUser = async (models: IModels, userId: string) =>
  models.Users.isSupportUser(userId);

authorizeRouter.get('/oauth/authorize', async (req: Request, res: Response) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const clientId = field(req.query.client_id, 200);
    const redirectUri = field(req.query.redirect_uri);
    // Platform clients ({subdomain} filled with this organisation) or its own
    const client = await findOAuthClient(models, clientId, subdomain);

    // Never redirect to an address the client did not register
    if (
      !client ||
      !redirectUri ||
      !client.redirectUrls?.includes(redirectUri)
    ) {
      return renderMessagePage(res, {
        status: 400,
        title: 'Cannot sign in',
        message:
          'This app is not registered for this address. Ask your erxes admin to check its OAuth client.',
      });
    }

    const challenge = field(req.query.code_challenge, 200);

    if (
      field(req.query.response_type) !== 'code' ||
      field(req.query.code_challenge_method) !== 'S256' ||
      !PKCE_VALUE.test(challenge)
    ) {
      return renderMessagePage(res, {
        status: 400,
        title: 'Cannot sign in',
        message:
          'The app sent an invalid sign-in request (authorization code with PKCE S256 is required).',
      });
    }

    const pending: PendingAuthorization = {
      clientId,
      clientName: client.name,
      redirectUri,
      codeChallenge: challenge,
      state: field(req.query.state, 500) || undefined,
      scope: field(req.query.scope, 500) || undefined,
    };

    const userId = await signedInUserId(models, subdomain, req);

    if (userId && !(await refuseSupportUser(models, userId))) {
      return issueCode(res, subdomain, null, pending, userId);
    }

    const id = createRandomToken(24);

    await redis.set(
      requestKey(subdomain, id),
      JSON.stringify(pending),
      'EX',
      REQUEST_SECS,
    );
    res.cookie(REQUEST_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure,
      path: '/',
      maxAge: REQUEST_SECS * 1000,
    });

    return renderLoginPage(res, { requestId: id, clientName: client.name });
  } catch (e) {
    console.error('[oauth] authorize failed', e);

    return renderMessagePage(res, {
      status: 500,
      title: 'Cannot sign in',
      message: 'Something went wrong. Try again in a moment.',
    });
  }
});

const loginMessage = (e: unknown) =>
  e instanceof LoginError
    ? e.message
    : isRateLimitError(e)
    ? e.message
    : 'Sign-in failed. Try again in a moment.';

authorizeRouter.post(
  '/oauth/authorize/login',
  async (req: Request, res: Response) => {
    const subdomain = getSubdomain(req);
    const loaded = await loadRequest(req, subdomain).catch(() => null);

    if (!loaded) {
      return expired(res);
    }

    const { id, pending } = loaded;
    const email = field(req.body?.email, 255);
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    try {
      const ip = getRequestIp(req);

      await checkRateLimit(`oauth:authorize:login:${ip}`, 20, 60);

      const models = await generateModels(subdomain);
      const result: StaffLoginResult = await logHandler(
        () => staffPasswordLogin({ models, subdomain, ip, email, password }),
        {
          subdomain,
          source: 'auth',
          action: 'login',
          payload: {
            headers: req.headers,
            email,
            oauthClientId: pending.clientId,
          },
        },
        null,
        null,
        true,
      );

      if (result.status !== 'loggedIn') {
        return result.status === 'two_factor_setup_required'
          ? renderMessagePage(res, {
              status: 403,
              title: 'Set up two-factor first',
              message:
                'Your account needs two-factor authentication. Sign in to erxes once to set it up, then come back to this app.',
            })
          : renderTwoFactorPage(res, {
              requestId: id,
              challenge: result.challenge,
              clientName: pending.clientName,
            });
      }

      if (await refuseSupportUser(models, String(result.user._id))) {
        return renderMessagePage(res, {
          status: 403,
          title: 'Not available',
          message: 'Apps cannot be opened during support access.',
        });
      }

      await startSession({
        models,
        subdomain,
        userId: result.user._id,
        method: result.method,
        req,
        res,
      });
      await afterStaffLogin(models, subdomain, result.method);

      return issueCode(res, subdomain, id, pending, String(result.user._id));
    } catch (e) {
      return renderLoginPage(res, {
        requestId: id,
        clientName: pending.clientName,
        email,
        error: loginMessage(e),
        status: 401,
      });
    }
  },
);

authorizeRouter.post(
  '/oauth/authorize/two-factor',
  async (req: Request, res: Response) => {
    const subdomain = getSubdomain(req);
    const loaded = await loadRequest(req, subdomain).catch(() => null);

    if (!loaded) {
      return expired(res);
    }

    const { id, pending } = loaded;
    const challenge = field(req.body?.challenge, 200);
    const code = field(req.body?.code, 64);

    try {
      const ip = getRequestIp(req);

      await checkRateLimit(`oauth:authorize:2fa:${ip}`, 20, 60);

      const models = await generateModels(subdomain);
      const { user, method }: Awaited<ReturnType<typeof staffTwoFactorLogin>> =
        await logHandler(
          () => staffTwoFactorLogin({ models, subdomain, ip, challenge, code }),
          {
            subdomain,
            source: 'auth',
            action: 'login',
            payload: {
              headers: req.headers,
              twoFactor: true,
              oauthClientId: pending.clientId,
            },
          },
          null,
          null,
          true,
        );

      if (await refuseSupportUser(models, String(user._id))) {
        return renderMessagePage(res, {
          status: 403,
          title: 'Not available',
          message: 'Apps cannot be opened during support access.',
        });
      }

      await startSession({
        models,
        subdomain,
        userId: user._id,
        method,
        req,
        res,
      });
      await afterStaffLogin(models, subdomain, method);

      return issueCode(res, subdomain, id, pending, String(user._id));
    } catch (e) {
      if (e instanceof LoginError && e.reason === 'two_factor_expired') {
        return expired(res);
      }

      return renderTwoFactorPage(res, {
        requestId: id,
        challenge,
        clientName: pending.clientName,
        error: loginMessage(e),
        status: 401,
      });
    }
  },
);

/** Public keys products use to verify erxes access tokens. */
authorizeRouter.get(
  '/.well-known/jwks.json',
  (_req: Request, res: Response) => {
    res.set('Cache-Control', 'public, max-age=300').json(getJwks());
  },
);

/** Redeems a code once; null when unknown, used or expired. */
export const redeemAuthorizationCode = async (
  subdomain: string,
  code: string,
): Promise<AuthorizationCode | null> => {
  const key = codeKey(subdomain, code);
  const [[, raw]] = (await redis.multi().get(key).del(key).exec()) as [
    [Error | null, string | null],
    [Error | null, number],
  ];

  return raw ? (JSON.parse(raw) as AuthorizationCode) : null;
};
