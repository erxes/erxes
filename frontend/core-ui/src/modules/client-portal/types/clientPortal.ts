export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  domain?: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
  tokenPassMethod?: 'cookie' | 'header';
  refreshTokenExpiration?: number;
  tokenExpiration?: number;
  enableMail?: boolean;
  enableManualVerification?: boolean;
  enableOTP?: boolean;
  enablePasswordVerification?: boolean;
  enableSocialpay?: boolean;
  enableTestUser?: boolean;
  enableToki?: boolean;
  enableTwoFactor?: boolean;
  otpConfig?: IOTPConfig;
  twoFactorConfig?: ITwoFactorConfig;
  mailConfig?: IMailConfig;
  passwordVerificationConfig?: IPasswordVerificationConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCredentials?: string;
  googleRedirectUri?: string;
  facebookAppId?: string;
  socialpayConfig?: ISocialpayConfig;
  tokiConfig?: ITokiConfig;
  testUserEmail?: string;
  testUserOTP?: string;
  testUserPassword?: string;
  testUserPhone?: string;
}

export interface IOTPConfig {
  smsConfig?: string;
  emailSubject?: string;
  content?: string;
  codeLength?: number;
  expireAfter?: number;
  loginWithOTP?: boolean;
}

export interface ITwoFactorConfig {
  codeLength?: number;
  content?: string;
  emailSubject?: string;
  enableTwoFactor?: boolean;
  expireAfter?: number;
  smsTransporterType?: string;
}

export interface IMailConfig {
  invitationContent?: string;
  registrationContent?: string;
  subject?: string;
}

export interface IPasswordVerificationConfig {
  verifyByOTP?: boolean;
  emailSubject?: string;
  emailContent?: string;
  smsContent?: string;
}

export interface IManualVerificationConfig {
  userIds?: string[];
  verifyCustomer?: boolean;
  verifyCompany?: boolean;
}

export interface ISocialpayConfig {
  publicKey: string;
  certId: string;
}

export interface ITokiConfig {
  merchantId: string;
  apiKey: string;
  username: string;
  password: string;
}

export enum ClientPortalHotKeyScope {
  ClientPortalSettingsPage = 'client-portal-settings-page',
  ClientPortalAddSheet = 'client-portal-add-sheet',
}
