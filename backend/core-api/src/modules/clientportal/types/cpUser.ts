import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export interface ICPNotificationConfig {
  notificationType: string;
  label: string;
  isAllowed: boolean;
}

export interface ICPNotificationSettings {
  receiveByEmail: boolean;
  receiveBySms: boolean;
  configs: ICPNotificationConfig[];
}

export interface ICPUserRegisterParams {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  password?: string;
  type?: string | 'customer' | 'company';
}

export interface IRefreshToken {
  token: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ISocialAuthProvider {
  provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE';
  providerId: string;
  email?: string;
  linkedAt: Date;
}

export interface IFcmDevice {
  deviceId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export interface ICPUser {
  type?: string;
  email?: string;
  phone?: string;
  username?: string;
  code?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;

  companyName?: string;
  companyRegistrationNumber?: string;
  clientPortalId: string;
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  customFieldsData?: any;

  // verification for company
  verificationRequest?: {
    status: string;
    attachments: IAttachment[];
    description?: string;
    verifiedBy?: string;
  };
  isVerified: boolean;

  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  // firebase cloud messaging devices (deviceId, token, platform) for push notifications
  fcmTokens?: IFcmDevice[];
  // Verification codes - unified structure
  actionCode?: {
    code: string;
    expires: Date;
    type:
      | 'EMAIL_VERIFICATION'
      | 'PHONE_VERIFICATION'
      | 'PASSWORD_RESET'
      | 'TWO_FACTOR_VERIFICATION'
      | 'EMAIL_CHANGE'
      | 'PHONE_CHANGE';
  };

  // Pending contact change (set while waiting for OTP confirmation)
  pendingEmail?: string;
  pendingPhone?: string;

  // Refresh tokens for token management
  refreshTokens?: IRefreshToken[];

  // Social auth providers for account linking
  socialAuthProviders?: ISocialAuthProvider[];

  // Security and tracking fields
  failedLoginAttempts?: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  primaryAuthMethod?: 'email' | 'phone' | 'social';
  otpResendAttempts?: number;
  otpResendLastAttempt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICPUserDocument extends ICPUser, Document {
  _id: string;
}
