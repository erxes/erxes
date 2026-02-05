import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  cpUserService,
  jwtManager,
  socialAuthService,
} from '@/clientportal/services';
import {
  loginWithCredentials,
  sendOTPForLogin,
  loginWithOTP,
  loginWithSocial,
} from '~/modules/clientportal/services/auth/login';
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
import {
  forgotPassword,
  resetPasswordWithCode,
  resetPasswordWithToken,
} from '~/modules/clientportal/services/auth/password';
import {
  generateCPUserLoginActivityLog,
  generateCPUserLogoutActivityLog,
  createCPUserActivityLog,
} from '@/clientportal/utils/activityLogs';

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

    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { ...user.toObject(), ...tokens };
    }

    return user;
  },

  async clientPortalUserLoginWithCredentials(
    _root: unknown,
    { email, phone, password }: LoginCredentialsParams,
    { models, subdomain, clientPortal, res }: IContext,
  ) {
    const user = await loginWithCredentials(
      email,
      phone,
      password,
      clientPortal,
      models,
    );

    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);
    const payload = generateCPUserLoginActivityLog(user, 'credentials');
    await createCPUserActivityLog(models, subdomain, payload, user);

    if (tokens?.token && tokens?.refreshToken) {
      return { success: true, ...tokens };
    }

    return 'Success';
  },

  async clientPortalLogout(
    _root: unknown,
    _args: unknown,
    { res, models, subdomain, cpUser }: IContext,
  ) {
    if (cpUser) {
      await models.CPUser.updateOne(
        { _id: cpUser._id || '' },
        { $set: { lastSeenAt: new Date(), isOnline: false } },
      );
      const payload = generateCPUserLogoutActivityLog(cpUser);
      await createCPUserActivityLog(models, subdomain, payload, cpUser);
    }

    jwtManager.clearAuthCookie(res);

    return 'loggedout';
  },

  async clientPortalUserForgotPassword(
    _root: unknown,
    { identifier }: ForgotPasswordParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    await forgotPassword(identifier, clientPortal, models, subdomain);
    return 'Password reset instructions have been sent';
  },

  async clientPortalUserResetPassword(
    _root: unknown,
    { token, identifier, code, newPassword }: ResetPasswordParams,
    { models, res, clientPortal }: IContext,
  ) {
    let user;

    if (
      identifier != null &&
      identifier !== '' &&
      code != null &&
      code !== ''
    ) {
      user = await resetPasswordWithCode(
        identifier,
        code,
        newPassword,
        clientPortal._id,
        models,
      );
    } else if (token) {
      user = await resetPasswordWithToken(token, newPassword, models);
    } else {
      throw new AuthenticationError(
        'Either token (for reset link) or identifier and code (for OTP) are required',
      );
    }

    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);

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
    await sendOTPForLogin(subdomain, identifier, clientPortal, models);
    return 'OTP has been sent to your email/phone';
  },

  async clientPortalUserLoginWithOTP(
    _root: unknown,
    { identifier, otp }: LoginOTPParams,
    { models, subdomain, clientPortal, res }: IContext,
  ) {
    const user = await loginWithOTP(identifier, otp, clientPortal, models);
    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);

    const payload = generateCPUserLoginActivityLog(user, 'otp');
    await createCPUserActivityLog(models, subdomain, payload, user);

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
    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);

    if (tokens?.token && tokens?.refreshToken) {
      return { ...user.toObject(), ...tokens };
    }
    return user;
  },

  async clientPortalUserLoginWithSocial(
    _root: unknown,
    { provider, token }: SocialAuthParams,
    { models, subdomain, clientPortal, res }: IContext,
  ) {
    const user = await loginWithSocial(provider, token, clientPortal, models);
    const tokens = jwtManager.setAuthCookie(res, user, clientPortal);
    const payload = generateCPUserLoginActivityLog(user, 'social');
    await createCPUserActivityLog(models, subdomain, payload, user);

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
    return jwtManager.refreshAndSetAuth(
      models,
      refreshToken,
      clientPortal,
      res,
    );
  },
};
