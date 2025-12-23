import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IModels } from '~/connectionResolvers';

const JWT_SECRET = process.env.JWT_TOKEN_SECRET || 'SECRET';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Generate access and refresh tokens
 */
export async function generateTokenPair(
  user: ICPUserDocument,
  clientPortal: IClientPortalDocument,
  rememberMe: boolean = false,
): Promise<TokenPair> {
  const authConfig = clientPortal.auth?.authConfig || {
    accessTokenExpirationInDays: 1,
    refreshTokenExpirationInDays: 7,
  };
  const accessTokenExpirationInDays =
    authConfig.accessTokenExpirationInDays || 1;
  const refreshTokenExpirationInDays =
    authConfig.refreshTokenExpirationInDays || 7;

  // Extended expiry for "Remember Me"
  const accessTokenExpiry = rememberMe
    ? accessTokenExpirationInDays * 7 // 7x longer if remember me
    : accessTokenExpirationInDays;

  const payload = {
    userId: user._id,
    clientPortalId: clientPortal._id,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${accessTokenExpiry}d`,
  });

  const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, {
    expiresIn: `${refreshTokenExpirationInDays}d`,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenExpirationInDays);

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(
  models: IModels,
  userId: string,
  refreshToken: string,
  expiresAt: Date,
  deviceId?: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<void> {
  const user = await models.CPUser.findOne({ _id: userId });

  if (!user) {
    throw new Error('User not found');
  }

  const refreshTokens = user.refreshTokens || [];

  // Remove expired tokens
  const validTokens = refreshTokens.filter(
    (token) => new Date(token.expiresAt) > new Date(),
  );

  // Add new token
  validTokens.push({
    token: refreshToken,
    deviceId,
    userAgent,
    ipAddress,
    createdAt: new Date(),
    expiresAt,
  });

  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: {
        refreshTokens: validTokens,
      },
    },
  );
}

/**
 * Verify and refresh access token
 */
export async function refreshAccessToken(
  models: IModels,
  refreshToken: string,
): Promise<{ accessToken: string; user: ICPUserDocument }> {
  try {
    const decoded: any = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await models.CPUser.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    const tokenData = user.refreshTokens?.find((t) => t.token === refreshToken);

    if (!tokenData || new Date(tokenData.expiresAt) <= new Date()) {
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const payload = {
      userId: user._id,
      clientPortalId: decoded.clientPortalId,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1d',
    });

    return {
      accessToken,
      user,
    };
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(
  models: IModels,
  userId: string,
  refreshToken: string,
): Promise<void> {
  const user = await models.CPUser.findOne({ _id: userId });

  if (!user) {
    return;
  }

  const refreshTokens =
    user.refreshTokens?.filter((t) => t.token !== refreshToken) || [];

  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: {
        refreshTokens,
      },
    },
  );
}

/**
 * Revoke all refresh tokens for a user (global logout)
 */
export async function revokeAllTokens(
  models: IModels,
  userId: string,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: {
        refreshTokens: [],
      },
    },
  );
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(
  models: IModels,
  userId: string,
): Promise<
  Array<{
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt?: Date;
    expiresAt: Date;
  }>
> {
  const user = await models.CPUser.findOne({ _id: userId });

  if (!user) {
    return [];
  }

  const now = new Date();
  return (
    user.refreshTokens?.filter((token) => new Date(token.expiresAt) > now) || []
  );
}
