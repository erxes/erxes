export type SocialAuthProvider = 'GOOGLE' | 'APPLE' | 'FACEBOOK';

export interface RegisterParams {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  userType?: string;
}

export interface EditUserParams {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
}

export interface VerifyParams {
  userId: string;
  code: string;
  email: string;
  phone: string;
}

export interface LoginCredentialsParams {
  email: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordParams {
  identifier: string;
}

export interface ResetPasswordParams {
  token?: string;
  identifier?: string;
  code?: string;
  newPassword: string;
}

export interface RequestOTPParams {
  identifier: string;
}

export interface LoginOTPParams {
  identifier: string;
  otp: string;
}

export interface SocialAuthParams {
  provider: SocialAuthProvider;
  token: string;
}

export interface UnlinkSocialParams {
  provider: SocialAuthProvider;
}

export interface RefreshTokenParams {
  refreshToken: string;
}

export type FcmPlatform = 'ios' | 'android' | 'web';

export interface FcmTokenAddParams {
  deviceId: string;
  token: string;
  platform: FcmPlatform;
}

export interface FcmTokenRemoveParams {
  deviceId: string;
}

export interface CpUsersAddParams {
  clientPortalId: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

export interface CpUsersEditParams {
  _id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  erxesCustomerId?: string;
}

export interface CpUsersSetPasswordParams {
  _id: string;
  newPassword: string;
}

export interface RequestChangeEmailParams {
  newEmail: string;
}

export interface ConfirmChangeEmailParams {
  code: string;
}

export interface RequestChangePhoneParams {
  newPhone: string;
}

export interface ConfirmChangePhoneParams {
  code: string;
}
