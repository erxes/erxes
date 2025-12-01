import { Document } from 'mongoose';

export interface IOTPConfig {
  emailSubject?: any;
  content: string;
  codeLength: number;
  smsTransporterType: string;
  loginWithOTP: boolean;
  expireAfter: number;
}
export interface TwoFactorConfig {
  emailSubject?: any;
  content: string;
  codeLength: number;
  smsTransporterType: string;
  enableTwoFactor: boolean;
  expireAfter: number;
}
export interface ISocialpayConfig {
  publicKey: string;
  certId: string;
}

export interface IMailConfig {
  subject: string;
  invitationContent: string;
  registrationContent: string;
}

export interface IManualVerificationConfig {
  userIds: string[];
  verifyCustomer: boolean;
  verifyCompany: boolean;
}

export interface IPasswordVerificationConfig {
  verifyByOTP: boolean;

  // email
  emailSubject: string;
  emailContent: string;

  // sms
  smsContent: string;
}

export interface ITokiConfig {
  merchantId: string;
  apiKey: string;
  username: string;
  password: string;
  production?: boolean;
}

export type EnvironmentVariable = {
  key: string;
  value: string;
};

export interface IClientPortal {
  name?: string;
  description?: string;
  url?: string;
  domain?: string;
  token?: string;
  // auth
  tokenExpiration?: number;
  refreshTokenExpiration?: number;
  tokenPassMethod?: 'cookie' | 'header';
  erxesAppToken?: string;
  otpConfig?: IOTPConfig;
  twoFactorConfig?: TwoFactorConfig;

  enableOTP?: boolean;
  enableTwoFactor?: boolean;
  enableSocialpay?: boolean;
  enableToki?: boolean;
  enableManualVerification?: boolean;
  enablePasswordVerification?: boolean;
  enableTestUser?: boolean;

  verificationMailConfig?: IMailConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  passwordVerificationConfig?: IPasswordVerificationConfig;
  socialpayConfig?: ISocialpayConfig;
  tokiConfig?: ITokiConfig;

  verificationType?: 'email' | 'phone' | 'both' | 'none';
  verificationCodeExpiresIn?: number;

  googleCredentials?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;

  testUserEmail?: string;
  testUserPhone?: string;
  testUserPassword?: string;
  testUserOTP?: number;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
