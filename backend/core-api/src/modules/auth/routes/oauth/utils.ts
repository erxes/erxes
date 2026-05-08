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

/**
 * Fast indexable hash for HIGH-ENTROPY server-issued opaque tokens
 * (refresh tokens, device codes, user codes generated via `crypto.randomBytes`
 * / `createUserCode`).
 *
 * DO NOT use this on user-supplied passwords or `client_secret` values — those
 * must go through `hashClientSecret`/`verifyClientSecret` (slow KDF with salt).
 * SHA-256 is appropriate here because the inputs are 48-byte
 * cryptographically-random strings (≥256 bits of entropy), making brute force
 * on a leaked hash computationally infeasible.
 */
export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ---------------------------------------------------------------------------
// Password hashing for OAuth `client_secret` (CWE-916 / js/insufficient-password-hash).
//
// `client_secret` is a password-equivalent credential under RFC 6749 §2.3.1 and
// must be hashed with a slow, salted KDF so a leaked `secretHash` cannot be
// brute-forced offline. We use Node's built-in `crypto.scrypt` (no extra
// dependency) with PHC-style encoding `scrypt$N=...,r=...,p=...$<salt>$<hash>`.
// `verifyClientSecret` parses the embedded N/r/p so any future tightening of
// `SCRYPT_N` etc. remains backward-compatible with hashes already stored under
// the prior parameters.
// ---------------------------------------------------------------------------

const scryptAsync = (
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions,
): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, keylen, options, (err, derived) =>
      err ? reject(err) : resolve(derived as Buffer),
    ),
  );

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LEN = 64;
const SCRYPT_SALT_LEN = 16;

// Node's default scrypt maxmem is 32 MiB and the runtime rejects calls when
// roughly `128 * N * r * p > maxmem`. We size maxmem from the actual params so
// future tuning of N or r doesn't trip ERR_CRYPTO_INVALID_SCRYPT_PARAMS, but we
// also cap maxmem to prevent a malformed stored hash from requesting absurd
// memory. 1 GiB is well above any sane production parameter set.
const SCRYPT_MAXMEM_CAP = 1024 * 1024 * 1024;

const scryptMaxmem = (N: number, r: number, p: number): number =>
  Math.min(SCRYPT_MAXMEM_CAP, Math.max(32 * 1024 * 1024, 256 * N * r * p));

const PHC_PARAMS_RE = /^N=(\d+),r=(\d+),p=(\d+)$/;

const parseScryptParams = (
  paramStr: string,
): { N: number; r: number; p: number } | null => {
  const m = PHC_PARAMS_RE.exec(paramStr);
  if (!m) return null;
  const N = Number(m[1]);
  const r = Number(m[2]);
  const p = Number(m[3]);
  // N must be a power of 2 ≥ 2 (scrypt cost factor); r and p kept in sane
  // bounds so a malformed stored hash can't request gigabytes of memory.
  if (!Number.isInteger(N) || N < 2 || (N & (N - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32) return null;
  if (!Number.isInteger(p) || p < 1 || p > 16) return null;
  if (128 * N * r * p > SCRYPT_MAXMEM_CAP) return null;
  return { N, r, p };
};

export const hashClientSecret = async (secret: string): Promise<string> => {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('client_secret must be a non-empty string');
  }
  const N = SCRYPT_N;
  const r = SCRYPT_R;
  const p = SCRYPT_P;
  const salt = crypto.randomBytes(SCRYPT_SALT_LEN);
  // Inputs here are all server-controlled (params from constants, salt from
  // randomBytes), so a scrypt failure means the deployment is misconfigured —
  // re-throw with a clearer message so callers (route handlers) don't surface
  // raw ERR_CRYPTO_INVALID_SCRYPT_PARAMS to the client.
  let derived: Buffer;
  try {
    derived = await scryptAsync(secret, salt, SCRYPT_KEY_LEN, {
      N,
      r,
      p,
      maxmem: scryptMaxmem(N, r, p),
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'unknown';
    throw new Error(`Failed to hash client_secret with scrypt: ${reason}`);
  }
  return [
    'scrypt',
    `N=${N},r=${r},p=${p}`,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
};

export const verifyClientSecret = async (
  secret: string,
  storedHash: string,
): Promise<boolean> => {
  if (typeof secret !== 'string' || secret.length === 0) return false;
  if (typeof storedHash !== 'string') return false;

  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;

  const params = parseScryptParams(parts[1]);
  if (!params) return false;

  const salt = Buffer.from(parts[2], 'base64');
  const expected = Buffer.from(parts[3], 'base64');
  if (salt.length === 0 || expected.length === 0) return false;

  // Treat any scrypt failure (memory pressure, ERR_CRYPTO_INVALID_SCRYPT_PARAMS
  // from a stored hash that slipped past parseScryptParams, etc.) as a
  // verification failure rather than letting the rejection propagate up to the
  // route handler — callers expect a boolean answer, and an unverifiable hash
  // is the auth-fail outcome regardless of why scrypt couldn't run.
  let derived: Buffer;
  try {
    derived = await scryptAsync(secret, salt, expected.length, {
      N: params.N,
      r: params.r,
      p: params.p,
      maxmem: scryptMaxmem(params.N, params.r, params.p),
    });
  } catch {
    return false;
  }

  return crypto.timingSafeEqual(derived, expected);
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

export const validateClientSecret = async (
  oauthClientApp: { type: string; secretHash?: string },
  clientSecret?: string,
): Promise<void> => {
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

  const ok = await verifyClientSecret(clientSecret, oauthClientApp.secretHash);
  if (!ok) {
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

export const checkRateLimit = async (
  key: string,
  limit: number,
  windowSecs: number,
): Promise<void> => {
  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSecs);
    }

    if (current > limit) {
      throw new RateLimitError('Too many requests. Please try again later.');
    }
  } catch (e) {
    throw e;
  }
};

// Use Express's `req.ip` so the trust-proxy setting (`DEFAULT_TRUST_PROXY =
// 'loopback, linklocal, uniquelocal'` from erxes-api-shared `applyTrustProxy`)
// is honored — i.e., we only trust `x-forwarded-for` when it came through a
// hop the operator has explicitly configured as a proxy. Parsing the header
// ourselves would let an unauthenticated client spoof the rate-limit key by
// rotating crafted `x-forwarded-for` values and either evade limits or
// throttle other users.
export const getClientIp = (req: Request): string =>
  req.ip || req.socket?.remoteAddress || 'unknown';

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
