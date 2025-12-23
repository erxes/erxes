import * as jwt from 'jsonwebtoken';
import { getEnv, authCookieOptions } from 'erxes-api-shared/utils';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

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

const REMEMBER_ME_MULTIPLIER = 7;

export class AuthService {
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
    return clientPortal.auth?.authConfig || DEFAULT_AUTH_CONFIG;
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
    rememberMe: boolean = false,
  ): { token: string; refreshToken: string } {
    const authConfig = this.getAuthConfig(clientPortal);
    const accessTokenExpirationInDays =
      authConfig.accessTokenExpirationInDays ?? DEFAULT_AUTH_CONFIG.accessTokenExpirationInDays;
    const refreshTokenExpirationInDays =
      authConfig.refreshTokenExpirationInDays ??
      DEFAULT_AUTH_CONFIG.refreshTokenExpirationInDays;

    const accessTokenExpiry = rememberMe
      ? accessTokenExpirationInDays * REMEMBER_ME_MULTIPLIER
      : accessTokenExpirationInDays;

    const payload = this.createJwtPayload(user, clientPortal);
    const refreshPayload = this.createJwtPayload(user, clientPortal, true);

    return {
      token: this.signToken(payload, accessTokenExpiry),
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
  ): string | void {
    const { token } = this.generateTokenPair(user, clientPortal);
    const deliveryMethod =
      clientPortal.auth?.authConfig?.deliveryMethod || 'cookie';

    if (deliveryMethod === 'header') {
      return token;
    }

    if (!res) {
      return;
    }

    const cookieOptions = this.getCookieOptions();
    res.cookie('client-auth-token', token, authCookieOptions(cookieOptions));
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

export const authService = new AuthService();
