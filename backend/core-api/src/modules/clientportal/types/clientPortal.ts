import { Document } from 'mongoose';

export interface IOTPEmailConfig {
  emailSubject?: string;
  messageTemplate: string;
  codeLength: number;
  duration: number;
  enableEmailVerification: boolean;
  enablePasswordlessLogin: boolean;
}

export interface IOTPSMSConfig {
  messageTemplate: string;
  codeLength: number;
  smsProvider: string;
  duration: number;
  enablePhoneVerification: boolean;
  enablePasswordlessLogin: boolean;
}

export interface IOTPConfig {
  email?: IOTPEmailConfig;
  sms?: IOTPSMSConfig;
}
export interface MultiFactorConfig {
  isEnabled: boolean;
  email?: IOTPEmailConfig;
  sms?: IOTPSMSConfig;
}
export interface ISocialpayConfig {
  enableSocialpay?: boolean;
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

export interface IResetPasswordConfig {
  mode: 'link' | 'code';

  // email
  emailSubject: string;
  emailContent: string;
}

export interface ITokiConfig {
  enableToki?: boolean;
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

export interface ITestUser {
  enableTestUser?: boolean;
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

export interface IAuthConfig {
  accessTokenExpirationInDays?: number;
  refreshTokenExpirationInDays?: number;
  deliveryMethod?: 'cookie' | 'header';
}

export interface IGoogleOAuthConfig {
  credentials?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface IFacebookOAuthConfig {
  appId?: string;
  appSecret?: string;
  redirectUri?: string;
}

export interface IOTPResendConfig {
  cooldownPeriodInSeconds?: number; // Default: 300 (5 minutes)
  maxAttemptsPerHour?: number; // Default: 5
}

export interface IFirebaseConfig {
  serviceAccountKey?: string; // JSON string of Firebase service account credentials
  enabled?: boolean; // Enable/disable Firebase notifications
}

export interface IClientPortal {
  name?: string;
  description?: string;
  url?: string;
  domain?: string;
  token?: string;
  erxesIntegrationToken?: string;
  auth: {
    authConfig?: IAuthConfig;
    googleOAuth?: IGoogleOAuthConfig;
    facebookOAuth?: IFacebookOAuthConfig;
    socialpayConfig?: ISocialpayConfig;
    tokiConfig?: ITokiConfig;
  };
  securityAuthConfig?: {
    otpConfig?: IOTPConfig;
    multiFactorConfig?: MultiFactorConfig;
    otpResendConfig?: IOTPResendConfig;
    resetPasswordConfig?: IResetPasswordConfig;
  };

  smsProvidersConfig?: {
    callPro: {
      phone?: string;
      token?: string;
    };
    twilio: {
      apiKey?: string;
      apiSecret?: string;
      apiUrl?: string;
    };
  };

  // verificationMailConfig?: IMailConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  enableManualVerification?: boolean;

  testUser?: ITestUser;

  firebaseConfig?: IFirebaseConfig;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
