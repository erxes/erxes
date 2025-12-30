import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { markResolvers } from 'erxes-api-shared/utils';
import { cpUserService } from '@/clientportal/services/cpUserService';
import { authService } from '@/clientportal/services/authService';
import { verificationService } from '@/clientportal/services/verificationService';
import { passwordService } from '@/clientportal/services/passwordService';
import { socialAuthService } from '@/clientportal/services/socialAuthService';
import { otpService } from '@/clientportal/services/otpService';
import {
  getSocialUserProfile,
  SocialAuthProvider,
} from '~/modules/clientportal/services/helpers/socialAuth';
import { refreshAccessToken } from '~/modules/clientportal/services/helpers/tokenManager';
import { AuthenticationError } from '@/clientportal/services/errorHandler';

interface RegisterParams {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  userType?: string;
}

interface EditUserParams {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
}

interface VerifyParams {
  userId: string;
  code: number;
  email: string;
  phone: string;
}

interface LoginCredentialsParams {
  email: string;
  phone: string;
  password: string;
}

interface ForgotPasswordParams {
  identifier: string;
}

interface ResetPasswordParams {
  token?: string;
  newPassword: string;
  otp?: number;
}

interface RequestOTPParams {
  identifier: string;
}

interface LoginOTPParams {
  identifier: string;
  otp: number;
}

interface SocialAuthParams {
  provider: SocialAuthProvider;
  token: string;
}

interface UnlinkSocialParams {
  provider: SocialAuthProvider;
}

interface RefreshTokenParams {
  refreshToken: string;
}

export const cpUserMutations: Record<string, Resolver> = {
  async clientPortalUserRegister(
    _root: unknown,
    params: RegisterParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    return cpUserService.registerUser(subdomain, clientPortal, params, models);
  },

  async clientPortalUserEdit(
    _root: unknown,
    params: EditUserParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('User not authenticated');
    }

    return cpUserService.updateUser(cpUser._id, params, models);
  },

  async clientPortalUserVerify(
    _root: unknown,
    { userId, code, email, phone }: VerifyParams,
    { models, clientPortal, res }: IContext,
  ) {
    const user = await cpUserService.verifyUser(
      userId,
      email,
      phone,
      code,
      clientPortal,
      models,
    );

    const token = authService.setAuthCookie(res, user, clientPortal);

    if (token) {
      return { ...user.toObject(), token };
    }

    return user;
  },

  async clientPortalUserLoginWithCredentials(
    _root: unknown,
    { email, phone, password }: LoginCredentialsParams,
    { models, clientPortal, res }: IContext,
  ) {
    const user = await cpUserService.login(
      email,
      phone,
      password,
      clientPortal,
      models,
    );

    const token = authService.setAuthCookie(res, user, clientPortal);

    if (token) {
      return { success: true, token };
    }

    return 'Success';
  },

  async clientPortalLogout(
    _root: unknown,
    _args: unknown,
    { res, models, cpUser }: IContext,
  ) {
    if (cpUser) {
      await models.CPUser.updateOne(
        { _id: cpUser._id || '' },
        { $set: { lastSeenAt: new Date(), isOnline: false } },
      );
    }

    authService.clearAuthCookie(res);

    return 'loggedout';
  },

  async clientPortalUserForgotPassword(
    _root: unknown,
    { identifier }: ForgotPasswordParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    await passwordService.forgotPassword(
      identifier,
      clientPortal,
      models,
      subdomain,
    );
    return 'Password reset instructions have been sent';
  },

  async clientPortalUserResetPassword(
    _root: unknown,
    { token, newPassword, otp }: ResetPasswordParams,
    { models, res, clientPortal }: IContext,
  ) {
    const user = await passwordService.resetPassword(
      token || '',
      newPassword,
      otp,
      models,
    );
    const authToken = authService.setAuthCookie(res, user, clientPortal);
    if (authToken) {
      return { success: true, token: authToken };
    }
    return 'Password reset successful';
  },

  async clientPortalUserRequestOTP(
    _root: unknown,
    { identifier }: RequestOTPParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    await verificationService.sendOTPForLogin(
      subdomain,
      identifier,
      clientPortal,
      models,
    );
    return 'OTP has been sent to your email/phone';
  },

  async clientPortalUserLoginWithOTP(
    _root: unknown,
    { identifier, otp }: LoginOTPParams,
    { models, clientPortal, res }: IContext,
  ) {
    const user = await otpService.loginWithOTP(
      identifier,
      otp,
      clientPortal,
      models,
    );
    const token = authService.setAuthCookie(res, user, clientPortal);
    if (token) {
      return { success: true, token };
    }
    return 'Success';
  },

  async clientPortalUserRegisterWithSocial(
    _root: unknown,
    { provider, token }: SocialAuthParams,
    { models, clientPortal, res }: IContext,
  ) {
    const profile = await getSocialUserProfile(provider, token, clientPortal);
    const user = await socialAuthService.registerWithSocial(
      provider,
      profile,
      clientPortal,
      models,
    );
    const authToken = authService.setAuthCookie(res, user, clientPortal);
    if (authToken) {
      return { ...user.toObject(), token: authToken };
    }
    return user;
  },

  async clientPortalUserLoginWithSocial(
    _root: unknown,
    { provider, token }: SocialAuthParams,
    { models, clientPortal, res }: IContext,
  ) {
    const user = await socialAuthService.loginWithSocial(
      provider,
      token,
      clientPortal,
      models,
    );
    const authToken = authService.setAuthCookie(res, user, clientPortal);
    if (authToken) {
      return { success: true, token: authToken };
    }
    return 'Success';
  },

  async clientPortalUserLinkSocialAccount(
    _root: unknown,
    { provider, token }: SocialAuthParams,
    { models, clientPortal, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await socialAuthService.linkSocialAccount(
      cpUser._id,
      provider,
      token,
      clientPortal,
      models,
    );

    return user;
  },

  async clientPortalUserUnlinkSocialAccount(
    _root: unknown,
    { provider }: UnlinkSocialParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await socialAuthService.unlinkSocialAccount(
      cpUser._id,
      provider,
      models,
    );
    return user;
  },

  async clientPortalUserRefreshToken(
    _root: unknown,
    { refreshToken }: RefreshTokenParams,
    { models, res, clientPortal }: IContext,
  ) {
    const { accessToken } = await refreshAccessToken(models, refreshToken);

    const deliveryMethod =
      clientPortal.auth?.authConfig?.deliveryMethod || 'cookie';

    if (deliveryMethod === 'header') {
      // Return token for header-based authentication
      return accessToken;
    }

    // Set new access token in cookie
    const cookieOptions: {
      httpOnly: boolean;
      sameSite?: 'none' | 'lax' | 'strict';
      secure?: boolean;
    } = {
      httpOnly: true,
    };

    const NODE_ENV = process.env.NODE_ENV;
    if (!['test', 'development'].includes(NODE_ENV || '')) {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
    }

    res.cookie('client-auth-token', accessToken, cookieOptions);

    return accessToken;
  },
};

markResolvers(cpUserMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
