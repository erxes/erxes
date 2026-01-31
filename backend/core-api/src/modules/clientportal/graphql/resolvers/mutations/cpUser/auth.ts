import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  cpUserService,
  authService,
  verificationService,
  passwordService,
  socialAuthService,
  otpService,
} from '@/clientportal/services';
import { getSocialUserProfile } from '@/clientportal/services/helpers/socialAuth';
import { AuthenticationError } from '@/clientportal/services/errorHandler';
import type {
  RegisterParams,
  VerifyParams,
  LoginCredentialsParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  RequestOTPParams,
  LoginOTPParams,
  SocialAuthParams,
  RefreshTokenParams,
} from '@/clientportal/types/cpUserParams';

export const authMutations: Record<string, Resolver> = {
  async clientPortalUserRegister(
    _root: unknown,
    params: RegisterParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    return cpUserService.registerUser(subdomain, clientPortal, params, models);
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

    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { ...user.toObject(), ...tokens };
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

    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { success: true, ...tokens };
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
    { token, identifier, code, newPassword }: ResetPasswordParams,
    { models, res, clientPortal }: IContext,
  ) {
    let user;

    if (identifier != null && identifier !== '' && code != null && code !== '') {
      user = await passwordService.resetPasswordWithCode(
        identifier,
        code,
        newPassword,
        clientPortal._id,
        models,
      );
    } else if (token) {
      user = await passwordService.resetPasswordWithToken(
        token,
        newPassword,
        models,
      );
    } else {
      throw new AuthenticationError(
        'Either token (for reset link) or identifier and code (for OTP) are required',
      );
    }

    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { success: true, ...tokens };
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
    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { success: true, ...tokens };
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
    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { ...user.toObject(), ...tokens };
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
    const tokens = authService.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { success: true, ...tokens };
    }
    return 'Success';
  },

  async clientPortalUserRefreshToken(
    _root: unknown,
    { refreshToken }: RefreshTokenParams,
    { models, res, clientPortal }: IContext,
  ) {
    return authService.refreshAndSetAuth(
      models,
      refreshToken,
      clientPortal,
      res,
    );
  },
};
