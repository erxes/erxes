import crypto from 'crypto';
import { canGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  extractUserFromHeader,
  getActivePlugins,
  getPlugin,
  redis,
} from 'erxes-api-shared/utils';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { IModels } from '~/connectionResolvers';
import {
  ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL,
  ACCESS_TOKEN_EXPIRES_IN_PUBLIC,
  REFRESH_TOKEN_EXPIRES_IN_CONFIDENTIAL,
  REFRESH_TOKEN_EXPIRES_IN_PUBLIC,
} from './constants';
import { OAuthClientInfo, OAuthScopeItem } from './types';

export const getAvailableOAuthScopesForUser = async ({
  subdomain,
  user,
}: {
  subdomain: string;
  user: IUserDocument;
}): Promise<OAuthScopeItem[]> => {
  const activePlugins = await getActivePlugins();
  const scopeMap = new Map<string, OAuthScopeItem>();

  for (const pluginName of activePlugins) {
    const plugin = await getPlugin(pluginName);
    const modules = plugin?.config?.meta?.permissions?.modules || [];

    for (const module of modules) {
      for (const action of module.actions || []) {
        const actionScopes = action.oauthScopes?.length
          ? action.oauthScopes
          : action.oauthScope
          ? [action.oauthScope]
          : [];

        if (actionScopes.length === 0) {
          continue;
        }

        const allowed =
          user.isOwner || (await canGroup(subdomain, action.name, user));

        if (!allowed) {
          continue;
        }

        for (const actionScope of actionScopes) {
          if (!scopeMap.has(actionScope)) {
            scopeMap.set(actionScope, {
              scope: actionScope,
              description: action.description || action.title || actionScope,
            });
          }
        }
      }
    }
  }

  return [...scopeMap.values()];
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const createRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const normalizeUserCode = (userCode: string) => {
  return (userCode || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

export const formatUserCode = (userCode: string) => {
  const normalized = normalizeUserCode(userCode);
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
};

export const createUserCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return code;
};

export const getOAuthClientApp = async (models: IModels, clientId: string) => {
  if (!clientId) {
    throw new Error('Missing client_id');
  }

  const oauthClientApp = await models.OAuthClientApps.findOne({
    clientId,
    status: 'active',
  }).lean();

  if (!oauthClientApp) {
    throw new Error('Invalid client_id');
  }

  return oauthClientApp;
};

export const validateClientSecret = (
  oauthClientApp: { type: string; secretHash?: string },
  clientSecret?: string,
): void => {
  if (oauthClientApp.type !== 'confidential') {
    return;
  }

  if (!clientSecret) {
    throw new ClientAuthError(
      'client_secret is required for confidential clients',
    );
  }

  if (!oauthClientApp.secretHash) {
    throw new ClientAuthError('Client secret is not configured');
  }

  const computed = Buffer.from(hashToken(clientSecret), 'hex');
  const stored = Buffer.from(oauthClientApp.secretHash, 'hex');

  if (
    computed.length !== stored.length ||
    !crypto.timingSafeEqual(computed, stored)
  ) {
    throw new ClientAuthError('Invalid client_secret');
  }
};

class ClientAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientAuthError';
  }
}

export const isClientAuthError = (e: unknown): e is ClientAuthError =>
  e instanceof ClientAuthError;

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const isRateLimitError = (e: unknown): e is RateLimitError =>
  e instanceof RateLimitError;

// Atomic INCR-and-set-TTL Lua script. INCR + EXPIRE issued as two separate
// commands is non-atomic: if the EXPIRE command is lost (process crash mid
// pipeline, network blip after INCR ACKs) the key becomes a permanent counter
// and Redis memory grows under sustained traffic. Doing both in a single
// EVAL keeps the counter and its TTL bound together — the EXPIRE is guaranteed
// to run on the first request iff the INCR returned 1, and the whole script
// executes atomically on the Redis server.
const RATE_LIMIT_INCR_SCRIPT = `
  local n = redis.call('INCR', KEYS[1])
  if n == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return n
`;

export const checkRateLimit = async (
  key: string,
  limit: number,
  windowSecs: number,
): Promise<void> => {
  // Defensive: every caller passes literal constants, but a future caller
  // computing windowSecs/limit from config (or env) could trip a 0/negative
  // and silently break the limiter (TTL=0 → no expiration on EXPIRE, or
  // EXPIRE rejected outright). Fail loud instead of degrading.
  if (!Number.isInteger(windowSecs) || windowSecs <= 0) {
    throw new Error(
      `checkRateLimit: windowSecs must be a positive integer (got ${windowSecs})`,
    );
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(
      `checkRateLimit: limit must be a positive integer (got ${limit})`,
    );
  }

  const current = (await redis.eval(
    RATE_LIMIT_INCR_SCRIPT,
    1,
    key,
    String(windowSecs),
  )) as number;

  if (current > limit) {
    throw new RateLimitError('Too many requests. Please try again later.');
  }
};

// Sanitize the client-IP string before it's used in a Redis rate-limit key.
// The IP arrives from `X-Forwarded-For` which is fully attacker-controlled
// when present, so without normalization an attacker can mint a fresh bucket
// per crafted payload (e.g. `1.2.3.4`, `1.2.3.4 `, `1.2.3.4#a`, …) and bypass
// the per-IP cap. We restrict to the character classes that valid IPv4/IPv6
// addresses (and the `unknown` fallback) actually use — hex digits, dots,
// colons, lowercase letters for "unknown" — and hard-bound the length
// (IPv6 with zone-id maxes out near 45 chars). Anything left empty after
// stripping collapses to the literal `unknown` bucket, which is still
// rate-limited but no longer attacker-malleable.
const sanitizeClientIp = (raw: string): string => {
  const cleaned = raw.replace(/[^a-fA-F0-9.:]/g, '').slice(0, 45);
  return cleaned || 'unknown';
};

export const getClientIp = (req: {
  headers: Record<string, any>;
  socket?: any;
}): string => {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return sanitizeClientIp(String(first).split(',')[0].trim());
  }

  return sanitizeClientIp(String(req.socket?.remoteAddress || 'unknown'));
};

// ---------------------------------------------------------------------------

export const getVerificationUri = () => {
  const frontendUrl =
    process.env.OAUTH_DEVICE_VERIFICATION_URI ||
    process.env.DOMAIN ||
    'http://localhost:3001';

  return `${frontendUrl.replace(/\/$/, '')}/oauth/device`;
};

export const getOAuthClientInfo = (
  client: Pick<OAuthClientInfo, 'id' | 'name' | 'description' | 'logo'>,
): OAuthClientInfo => {
  const normalized = client.name?.trim() || client.id.trim() || 'application';

  return {
    id: client.id,
    name: client.name || normalized,
    description:
      client.description ||
      'An application requesting delegated access to your workspace',
    logo: client.logo,
    logoText: normalized
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
  };
};

export const createOAuthAccessToken = async ({
  models,
  user,
  clientId,
  subdomain,
  expiresIn,
  scope,
}: {
  models: IModels;
  user: IUserDocument;
  clientId: string;
  subdomain: string;
  expiresIn: number;
  scope?: string;
}) => {
  const token = jwt.sign(
    {
      typ: 'oauth_access',
      sub: user._id,
      user: await models.Users.getTokenFields(user),
      clientId,
      subdomain,
      ...(scope ? { scope } : {}),
    },
    models.Users.getSecret(),
    { expiresIn },
  );

  await redis.set(`user_token_${user._id}_${token}`, 1, 'EX', expiresIn);

  return token;
};

export const createOAuthRefreshToken = async ({
  models,
  userId,
  clientId,
  expiresIn,
  scope,
}: {
  models: IModels;
  userId: string;
  clientId: string;
  expiresIn: number;
  scope?: string;
}) => {
  const refreshToken = createRandomToken(48);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await models.OAuthRefreshTokens.create({
    tokenHash,
    userId,
    clientId,
    expiresAt,
    ...(scope ? { scope } : {}),
  });

  return { refreshToken, tokenHash, expiresAt };
};

export const buildTokenResponse = async ({
  models,
  user,
  clientId,
  subdomain,
  clientType,
  scope,
}: {
  models: IModels;
  user: IUserDocument;
  clientId: string;
  subdomain: string;
  clientType: 'public' | 'confidential';
  scope?: string;
}) => {
  const accessExpiresIn =
    clientType === 'confidential'
      ? ACCESS_TOKEN_EXPIRES_IN_CONFIDENTIAL
      : ACCESS_TOKEN_EXPIRES_IN_PUBLIC;

  const refreshExpiresIn =
    clientType === 'confidential'
      ? REFRESH_TOKEN_EXPIRES_IN_CONFIDENTIAL
      : REFRESH_TOKEN_EXPIRES_IN_PUBLIC;

  const accessToken = await createOAuthAccessToken({
    models,
    user,
    clientId,
    subdomain,
    expiresIn: accessExpiresIn,
    scope,
  });

  const { refreshToken } = await createOAuthRefreshToken({
    models,
    userId: user._id,
    clientId,
    expiresIn: refreshExpiresIn,
    scope,
  });

  await models.OAuthClientApps.updateOne(
    { clientId },
    { $set: { lastUsedAt: new Date() } },
  );

  return {
    tokenType: 'Bearer',
    accessToken,
    refreshToken,
    expiresIn: accessExpiresIn,
    user: await models.Users.getTokenFields(user),
  };
};

export const getAuthenticatedUserId = (req: Request) => {
  const user = extractUserFromHeader(req.headers) as { _id?: string } | null;

  if (!user?._id) {
    throw new Error('Not authenticated');
  }

  return user._id;
};

export const sendOAuthError = (
  res: Response,
  status: number,
  error: string,
  errorDescription?: string,
) => {
  return res.status(status).json({
    error,
    ...(errorDescription && { error_description: errorDescription }),
  });
};
