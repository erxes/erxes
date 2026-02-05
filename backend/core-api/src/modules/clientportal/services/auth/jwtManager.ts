import * as jwt from 'jsonwebtoken';
import { getEnv, authCookieOptions } from 'erxes-api-shared/utils';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IModels } from '~/connectionResolvers';

interface JwtPayload {
  userId: string;
  clientPortalId?: string;
  type?: 'refresh';
}

interface CookieOptions {
  httpOnly: boolean;
  sameSite?: 'none' | 'lax' | 'strict';
  secure?: boolean;
}

const DEFAULT_AUTH_CONFIG = {
  accessTokenExpirationInDays: 1,
  refreshTokenExpirationInDays: 7,
};

export class JwtManager {
  private getJwtSecret(): string {
    const secret = process.env.JWT_TOKEN_SECRET || 'SECRET';
    const NODE_ENV = process.env.NODE_ENV;

    if (NODE_ENV === 'production' && (!secret || secret === 'SECRET')) {
      throw new Error('JWT_TOKEN_SECRET must be set in production');
    }

    return secret;
  }

  private getAuthConfig(
    clientPortal: IClientPortalDocument,
  ): typeof DEFAULT_AUTH_CONFIG {
    return (clientPortal.auth?.authConfig ??
      (DEFAULT_AUTH_CONFIG as typeof DEFAULT_AUTH_CONFIG)) as typeof DEFAULT_AUTH_CONFIG;
  }

  private createJwtPayload(
    user: ICPUserDocument,
    clientPortal: IClientPortalDocument,
    isRefresh = false,
  ): JwtPayload {
    return {
      userId: user._id,
      clientPortalId: clientPortal._id,
      ...(isRefresh && { type: 'refresh' }),
    };
  }

  private signToken(payload: JwtPayload, expiresInDays: number): string {
    const secret = this.getJwtSecret();
    return jwt.sign(payload, secret, {
      expiresIn: `${expiresInDays}d`,
    });
  }

  generateTokenPair(
    user: ICPUserDocument,
    clientPortal: IClientPortalDocument,
    _rememberMe: boolean = false,
  ): { token: string; refreshToken: string } {
    const authConfig = this.getAuthConfig(clientPortal);
    const accessTokenExpirationInDays =
      authConfig.accessTokenExpirationInDays ??
      DEFAULT_AUTH_CONFIG.accessTokenExpirationInDays;
    const refreshTokenExpirationInDays =
      authConfig.refreshTokenExpirationInDays ??
      DEFAULT_AUTH_CONFIG.refreshTokenExpirationInDays;

    const payload = this.createJwtPayload(user, clientPortal);
    const refreshPayload = this.createJwtPayload(user, clientPortal, true);

    return {
      token: this.signToken(payload, accessTokenExpirationInDays),
      refreshToken: this.signToken(refreshPayload, refreshTokenExpirationInDays),
    };
  }

  private getCookieOptions(): CookieOptions {
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });
    const options: CookieOptions = {
      httpOnly: true,
    };

    if (!['test', 'development'].includes(NODE_ENV)) {
      options.sameSite = 'none';
      options.secure = true;
    }

    return options;
  }

  setAuthCookie(
    res: any,
    user: ICPUserDocument,
    clientPortal: IClientPortalDocument,
  ): { token: string; refreshToken: string } | void {
    const { token, refreshToken } = this.generateTokenPair(user, clientPortal);
    const deliveryMethod =
      clientPortal.auth?.authConfig?.deliveryMethod || 'cookie';

    if (deliveryMethod === 'header') {
      return { token, refreshToken };
    }

    if (!res) {
      return;
    }

    const cookieOptions = this.getCookieOptions();
    res.cookie('client-auth-token', token, authCookieOptions(cookieOptions));
  }

  setAccessTokenCookie(
    res: any,
    accessToken: string,
    clientPortal: IClientPortalDocument,
  ): void {
    const deliveryMethod =
      clientPortal.auth?.authConfig?.deliveryMethod || 'cookie';

    if (deliveryMethod === 'header' || !res) {
      return;
    }

    const cookieOptions = this.getCookieOptions();
    res.cookie('client-auth-token', accessToken, authCookieOptions(cookieOptions));
  }

  async refreshAccessToken(
    models: IModels,
    refreshToken: string,
    clientPortal: IClientPortalDocument,
  ): Promise<{ accessToken: string; user: ICPUserDocument }> {
    const secret = this.getJwtSecret();

    const decoded = jwt.verify(refreshToken, secret) as JwtPayload;

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

    const tokenData = user.refreshTokens?.find((t) => t.token === refreshToken);

    if (!tokenData || new Date(tokenData.expiresAt) <= new Date()) {
      throw new Error('Refresh token expired');
    }

    const authConfig = this.getAuthConfig(clientPortal);
    const accessTokenExpirationInDays =
      authConfig.accessTokenExpirationInDays ??
      DEFAULT_AUTH_CONFIG.accessTokenExpirationInDays;

    const payload = {
      userId: user._id,
      clientPortalId: decoded.clientPortalId,
    };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: `${accessTokenExpirationInDays}d`,
    });

    return {
      accessToken,
      user,
    };
  }

  async refreshAndSetAuth(
    models: IModels,
    refreshToken: string,
    clientPortal: IClientPortalDocument,
    res: any,
  ): Promise<string> {
    const { accessToken } = await this.refreshAccessToken(
      models,
      refreshToken,
      clientPortal,
    );

    const deliveryMethod =
      clientPortal.auth?.authConfig?.deliveryMethod || 'cookie';

    if (deliveryMethod === 'header') {
      return accessToken;
    }

    this.setAccessTokenCookie(res, accessToken, clientPortal);
    return accessToken;
  }

  clearAuthCookie(res: any): void {
    if (!res) {
      return;
    }

    const options = this.getCookieOptions();
    res.clearCookie('client-auth-token', options);
  }

  createClientPortalToken(clientPortalId: string): string {
    const secret = this.getJwtSecret();
    return jwt.sign({ clientPortalId }, secret);
  }
}

export const jwtManager = new JwtManager();
