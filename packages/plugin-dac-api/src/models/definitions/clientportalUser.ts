import { Document } from 'mongoose';
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
  type?: string;
  deviceTokens?: string[];
  clientPortalId: string;
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOnline: boolean;
  lastSeenAt: Date;
  sessionCount: number;
  notificationSettings: INotifcationSettings;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  phoneVerificationCode: string;
  phoneVerificationCodeExpires: Date;
  emailVerificationCode: string;
  emailVerificationCodeExpires: Date;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  userId: string;
}
