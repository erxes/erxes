import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export interface INotificationConfig {
  notifType: string;
  label: string;
  isAllowed: boolean;
}

export interface INotifcationSettings {
  receiveByEmail: boolean;
  receiveBySms: boolean;
  configs: INotificationConfig[];
}

export interface IUser {
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
  twoFactorDevices?: ITwoFactorDevice[];
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
  notificationSettings: INotifcationSettings;
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

export interface IInvitiation extends IUser {
  disableVerificationMail?: boolean;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  phoneVerificationCode: string;
  phoneVerificationCodeExpires: Date;
  emailVerificationCode: string;
  emailVerificationCodeExpires: Date;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export interface ITwoFactorDevice {
  device: string;
  key: string;
  date: Date;
}

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
  password?: string;
  twoFactor?: ITwoFactorDevice;
}

export interface IContactsParams {
  models: IModels;
  clientPortalId: string;
  document: any;
  password?: string;
}
