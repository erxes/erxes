import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { canGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { getActivePlugins, getPlugin, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const DEVICE_CODE_EXPIRES_IN = 10 * 60;
export const DEVICE_POLL_INTERVAL = 5;
export const ACCESS_TOKEN_EXPIRES_IN = 15 * 60;
export const REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60;

type OAuthClientInfo = {
  id: string;
  name: string;
  description: string;
  logoText: string;
  logo?: string;
};

type OAuthScopeItem = {
  scope: string;
  description: string;
};

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
    throw new ClientAuthError('client_secret is required for confidential clients');
  }

  if (!oauthClientApp.secretHash) {
    throw new ClientAuthError('Client secret is not configured');
  }

  if (hashToken(clientSecret) !== oauthClientApp.secretHash) {
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

/**
 * Sliding-window counter via Redis INCR + EXPIRE.
 * Throws RateLimitError when the caller exceeds `limit` calls within `windowSecs`.
 */
export const checkRateLimit = async (
  key: string,
  limit: number,
  windowSecs: number,
): Promise<void> => {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSecs);
  }

  if (current > limit) {
    throw new RateLimitError('Too many requests. Please try again later.');
  }
};

export const getClientIp = (req: {
  headers: Record<string, any>;
  socket?: any;
}): string => {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return first.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
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
}: {
  models: IModels;
  user: IUserDocument;
  clientId: string;
  subdomain: string;
}) => {
  const token = jwt.sign(
    {
      typ: 'oauth_access',
      sub: user._id,
      user: await models.Users.getTokenFields(user),
      clientId,
      subdomain,
    },
    models.Users.getSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );

  await redis.set(
    `user_token_${user._id}_${token}`,
    1,
    'EX',
    ACCESS_TOKEN_EXPIRES_IN,
  );

  return token;
};

export const createOAuthRefreshToken = async ({
  models,
  userId,
  clientId,
}: {
  models: IModels;
  userId: string;
  clientId: string;
}) => {
  const refreshToken = createRandomToken(48);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);

  await models.OAuthRefreshTokens.create({
    tokenHash,
    userId,
    clientId,
    expiresAt,
  });

  return { refreshToken, tokenHash, expiresAt };
};

export const buildTokenResponse = async ({
  models,
  user,
  clientId,
  subdomain,
}: {
  models: IModels;
  user: IUserDocument;
  clientId: string;
  subdomain: string;
}) => {
  const accessToken = await createOAuthAccessToken({
    models,
    user,
    clientId,
    subdomain,
  });
  const { refreshToken } = await createOAuthRefreshToken({
    models,
    userId: user._id,
    clientId,
  });

  await models.OAuthClientApps.updateOne(
    { clientId },
    { $set: { lastUsedAt: new Date() } },
  );

  return {
    tokenType: 'Bearer',
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    user: await models.Users.getTokenFields(user),
  };
};
