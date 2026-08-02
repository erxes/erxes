import * as dotenv from 'dotenv';

import {
  getSubdomain,
  redis,
  setClientPortalHeader,
  setCPUserHeader,
  setUserHeader,
} from 'erxes-api-shared/utils';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import fetch from 'node-fetch';
import { generateModels, IModels } from '../connectionResolver';

dotenv.config();

export interface GatewayPrincipal {
  _id?: string;
  loginToken?: string;
  sessionCode?: string | string[];
  oauthClientId?: string;
  oauthScopes?: string[];
  oauthAllowedPublicOperationIds?: string[];
  [key: string]: unknown;
}

interface OAuthAccessTokenPayload extends jwt.JwtPayload {
  typ?: string;
  user?: { _id?: string };
  clientId?: string;
  subdomain?: string;
  scope?: string;
}

export type GatewayRequest = Request & {
  user?: GatewayPrincipal;
  cpUser?: GatewayPrincipal;
  clientPortal?: GatewayPrincipal;
};

const DEBUG_GATEWAY_AUTH = process.env.DEBUG_GATEWAY_AUTH === 'true';

const shouldDebugAuth = (req: Request) =>
  DEBUG_GATEWAY_AUTH &&
  (req.originalUrl.startsWith('/graphql') ||
    req.originalUrl.startsWith('/public/graphql'));

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex').slice(0, 12);

const debugAuth = (
  req: GatewayRequest,
  event: string,
  extra: Record<string, unknown> = {},
) => {
  if (!shouldDebugAuth(req)) {
    return;
  }

  console.log(
    JSON.stringify({
      scope: 'gateway-auth',
      event,
      method: req.method,
      path: req.originalUrl,
      hostname: req.hostname,
      hasUser: Boolean(req.user?._id),
      hasClientPortalUser: Boolean(req.cpUser?._id),
      ...extra,
    }),
  );
};

const getBearerToken = (req: Request) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return '';
  }

  if (Array.isArray(authorization)) {
    throw new Error('Multiple authorization headers');
  }

  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  return match?.[1] || '';
};

// skipcq: JS-R1005 — legacy middleware complexity
export default async function userMiddleware(
  req: GatewayRequest,
  res: Response,
  next: NextFunction,
) {
  const startedAt = Date.now();
  const url = req.headers['erxes-core-website-url'];
  const erxesCoreToken = req.headers['erxes-core-token'];

  debugAuth(req, 'start', {
    hasAuthorizationHeader: Boolean(req.headers.authorization),
    hasAuthCookie: Boolean(req.cookies?.['auth-token']),
    hasClientAuthToken: Boolean(
      req.headers['client-auth-token'] || req.cookies?.['client-auth-token'],
    ),
    hasClientPortalToken: Boolean(req.headers['x-app-token']),
  });

  if (Array.isArray(erxesCoreToken)) {
    debugAuth(req, 'invalid-erxes-core-token-header');
    return res.status(400).json({ error: `Multiple erxes-core-tokens found` });
  }

  if (erxesCoreToken && url) {
    try {
      const response = await fetch('https://erxes.io/check-website', {
        method: 'POST',
        headers: {
          'erxes-core-token': erxesCoreToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
        }),
      }).then((r) => r.text());

      if (response === 'ok') {
        req.user = {
          _id: 'userId',
          customPermissions: [
            {
              action: 'showIntegrations',
              allowed: true,
              requiredActions: [],
            },
            {
              action: 'showKnowledgeBase',
              allowed: true,
              requiredActions: [],
            },
            {
              action: 'showScripts',
              allowed: true,
              requiredActions: [],
            },
          ],
        };
      }
    } catch {
      debugAuth(req, 'website-token-check-error', {
        durationMs: Date.now() - startedAt,
      });
      return next();
    }

    debugAuth(req, 'website-token-accepted', {
      durationMs: Date.now() - startedAt,
    });
    return next();
  }

  const appToken = (req.headers['erxes-app-token'] || '').toString();
  let subdomain: string;

  try {
    subdomain = getSubdomain(req);
  } catch (e: unknown) {
    debugAuth(req, 'missing-hostname', {
      error: e instanceof Error ? e.message : 'unknown',
      durationMs: Date.now() - startedAt,
    });

    return res.status(400).json({ error: 'Hostname is required' });
  }

  let models: IModels;
  try {
    models = await generateModels(subdomain);
  } catch (e: unknown) {
    debugAuth(req, 'generate-models-error', {
      subdomain,
      error: e instanceof Error ? e.message : 'unknown',
      durationMs: Date.now() - startedAt,
    });

    if (e instanceof Error) {
      return res.status(500).json({ error: e.message });
    } else {
      // In case `e` is not an instance of Error, handle it accordingly
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }

  if (appToken) {
    try {
      const appInDb = await models.Apps.findOne({
        token: appToken,
        status: 'active',
      });

      if (!appInDb) {
        debugAuth(req, 'invalid-app-token', {
          subdomain,
          durationMs: Date.now() - startedAt,
        });
        return res.status(401).json({ error: 'Invalid app token' });
      }

      await models.Apps.updateOne(
        { _id: appInDb._id },
        { $set: { lastUsedAt: new Date() } },
      );

    } catch (e) {
      console.error(e);
      debugAuth(req, 'app-token-error', {
        subdomain,
        error: e instanceof Error ? e.message : 'unknown',
        durationMs: Date.now() - startedAt,
      });

      return next();
    }
  }

  const clientPortalToken = req.headers['x-app-token'];
  const clientAuthToken =
    req.headers['client-auth-token'] || req.cookies['client-auth-token'];

  if (clientPortalToken) {
    const clientPortalTokenString = String(clientPortalToken);

    try {
      const clientPortalTokenDecoded: any = jwt.verify(
        clientPortalTokenString,
        process.env.JWT_TOKEN_SECRET || 'SECRET',
      );

      const clientPortal = await models.ClientPortals.findOne({
        _id: clientPortalTokenDecoded.clientPortalId,
      });

      if (!clientPortal) {
        debugAuth(req, 'client-portal-not-found', {
          subdomain,
          durationMs: Date.now() - startedAt,
        });
        return next();
      }

      req.clientPortal = clientPortal;

      setClientPortalHeader(req.headers, req.clientPortal);

      if (clientAuthToken) {
        try {
          const clientAuthTokenString = String(clientAuthToken);

          const clientAuthTokenDecoded: any = jwt.verify(
            clientAuthTokenString,
            process.env.JWT_TOKEN_SECRET || 'SECRET',
          );

          const clientPortalUser = await models.CPUsers.findOne({
            _id: clientAuthTokenDecoded.userId,
            clientPortalId: clientPortal._id,
          });

          if (clientPortalUser) {
            req.cpUser = clientPortalUser;
            setCPUserHeader(req.headers, req.cpUser);
            debugAuth(req, 'client-portal-user-set', {
              subdomain,
              clientPortalId: String(clientPortal._id),
              durationMs: Date.now() - startedAt,
            });
          }
        } catch (e) {
          if (e instanceof jwt.TokenExpiredError) {
            debugAuth(req, 'client-auth-token-expired', {
              subdomain,
              durationMs: Date.now() - startedAt,
            });
            return next();
          } else {
            console.error(e);
            debugAuth(req, 'client-auth-token-error', {
              subdomain,
              error: e instanceof Error ? e.message : 'unknown',
              durationMs: Date.now() - startedAt,
            });
          }
        }
      }

      // return next();
    } catch (e) {
      console.error(e);
      debugAuth(req, 'client-portal-token-error', {
        subdomain,
        error: e instanceof Error ? e.message : 'unknown',
        durationMs: Date.now() - startedAt,
      });

      return next();
    }
  }

  let bearerToken = '';

  try {
    bearerToken = getBearerToken(req);
  } catch (e) {
    if (e instanceof Error) {
      return res.status(400).json({ error: e.message });
    }
  }

  const token = bearerToken || req.cookies['auth-token'];

  if (!token) {
    debugAuth(req, 'no-user-token', {
      subdomain,
      durationMs: Date.now() - startedAt,
    });
    return next();
  }

  try {
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET || 'SECRET',
    );

    if (typeof decodedValue === 'string') {
      return next();
    }

    const decoded = decodedValue as OAuthAccessTokenPayload;
    const tokenUser = decoded.user;

    if (typeof tokenUser?._id !== 'string') {
      debugAuth(req, 'decoded-user-missing-id', {
        subdomain,
        tokenHash: hashToken(token),
        decodedKeys: Object.keys(decoded),
        durationMs: Date.now() - startedAt,
      });
      return next();
    }

    const userId = tokenUser._id;
    const userDoc = await models.Users.findOne(
      { _id: userId },
      '_id email details isOwner groupIds brandIds username code branchIds departmentIds permissionGroupIds customPermissions',
    ).lean();

    if (!userDoc) {
      debugAuth(req, 'user-not-found', {
        subdomain,
        userId,
        tokenHash: hashToken(token),
        durationMs: Date.now() - startedAt,
      });
      return next();
    }

    const validatedToken = await redis.get(`user_token_${userId}_${token}`);

    if (!validatedToken) {
      debugAuth(req, 'redis-user-token-missing', {
        subdomain,
        userId,
        tokenHash: hashToken(token),
        durationMs: Date.now() - startedAt,
      });
      return next();
    }

    const authenticatedUser: GatewayPrincipal = {
      ...userDoc,
      loginToken: token,
      sessionCode: req.headers.sessioncode || '',
    };

    if (decoded.typ === 'oauth_access') {
      const clientId =
        typeof decoded.clientId === 'string' ? decoded.clientId : '';
      const tokenSubdomain =
        typeof decoded.subdomain === 'string' ? decoded.subdomain : '';

      if (!clientId || tokenSubdomain !== subdomain) {
        return res.status(401).json({ error: 'Invalid OAuth access token' });
      }

      const oauthClient = await models.OAuthClientApps.findOne(
        { clientId, status: 'active' },
        'allowedPublicOperationIds',
      ).lean();

      if (!oauthClient) {
        return res.status(401).json({ error: 'OAuth client is not active' });
      }

      authenticatedUser.oauthClientId = clientId;
      authenticatedUser.oauthScopes = String(decoded.scope || '')
        .split(/\s|,/)
        .map((scope) => scope.trim())
        .filter(Boolean);
      authenticatedUser.oauthAllowedPublicOperationIds =
        oauthClient.allowedPublicOperationIds || [];
    }

    const hostname = await redis.get('hostname');

    if (!hostname) {
      redis.set('hostname', process.env.DOMAIN || 'http://localhost:3001');
    }

    req.user = authenticatedUser;
    setUserHeader(req.headers, authenticatedUser);
    debugAuth(req, 'user-header-set', {
      subdomain,
      userId: authenticatedUser._id,
      tokenHash: hashToken(token),
      durationMs: Date.now() - startedAt,
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      debugAuth(req, 'user-token-expired', {
        subdomain,
        tokenHash: token ? hashToken(token) : '',
        durationMs: Date.now() - startedAt,
      });
      return next();
    } else {
      console.error(e);
      debugAuth(req, 'user-token-error', {
        subdomain,
        error: e instanceof Error ? e.message : 'unknown',
        tokenHash: token ? hashToken(token) : '',
        durationMs: Date.now() - startedAt,
      });
    }
  }

  return next();
}
