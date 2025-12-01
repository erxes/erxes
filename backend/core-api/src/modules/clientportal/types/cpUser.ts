import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export interface ICPNotificationConfig {
  notifType: string;
  label: string;
  isAllowed: boolean;
}

export interface ICPNotifcationSettings {
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
  password?: string;
  type?: string | 'customer' | 'admin';
}

export interface ICPUser {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  code?: string;
  password?: string;
  secondaryPassword?: string;
  type?: string;
  deviceTokens?: string[];
  twoFactorDevices?: ICPTwoFactorDevice[];
  clientPortalId: string;
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
  notificationSettings: ICPNotifcationSettings;
  avatar?: string;
  customFieldsData?: any;
  facebookId?: string;
  googleId?: string;

  // verification for company
  verificationRequest?: {
    status: string;
    attachments: IAttachment[];
    description?: string;
    verifiedBy?: string;
  };
}

export interface ICPInvitiation extends ICPUser {
  disableVerificationMail?: boolean;
}

export interface ICPUserDocument extends ICPUser, Document {
  _id: string;
  isVerified: boolean;
  verificationCode: number;
  verificationCodeExpires: Date;
  phoneVerificationCode: string;
  phoneVerificationCodeExpires: Date;
  emailVerificationCode: string;
  emailVerificationCodeExpires: Date;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export interface ICPTwoFactorDevice {
  device: string;
  key: string;
  date: Date;
}

export interface ICPVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
  password?: string;
  twoFactor?: ICPTwoFactorDevice;
}

export interface ICPContactsParams {
  models: IModels;
  clientPortalId: string;
  document: any;
  password?: string;
}
