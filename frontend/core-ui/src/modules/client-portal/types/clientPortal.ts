export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  domain?: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
  url?: string;
  erxesIntegrationToken?: string;
  enableManualVerification?: boolean;
  auth?: {
    authConfig?: {
      deliveryMethod?: 'cookie' | 'header';
      accessTokenExpirationInDays?: number;
      refreshTokenExpirationInDays?: number;
    };
    googleOAuth?: {
      clientId?: string;
      clientSecret?: string;
      credentials?: string;
      redirectUri?: string;
    };
    facebookOAuth?: {
      appId?: string;
      appSecret?: string;
      redirectUri?: string;
    };
    socialpayConfig?: ISocialpayConfig;
    tokiConfig?: ITokiConfig;
  };
  securityAuthConfig?: {
    otpConfig?: IOTPConfig;
    multiFactorConfig?: MultiFactorConfig;
    otpResendConfig?: {
      cooldownPeriodInSeconds?: number;
      maxAttemptsPerHour?: number;
    };
    resetPasswordConfig?: {
      mode?: 'link' | 'code';
      emailSubject?: string;
      emailContent?: string;
    };
  };
  smsProvidersConfig?: {
    callPro?: any;
    twilio?: any;
  };
  manualVerificationConfig?: IManualVerificationConfig;
  testUser?: {
    enableTestUser?: boolean;
    email?: string;
    phone?: string;
    password?: string;
    otp?: number;
  };
}

export interface IOTPEmailConfig {
  emailSubject?: string;
  messageTemplate?: string;
  codeLength?: number;
  duration?: number;
  enableEmailVerification?: boolean;
  enablePasswordlessLogin?: boolean;
}

export interface IOTPSMSConfig {
  messageTemplate?: string;
  codeLength?: number;
  smsProvider?: string;
  duration?: number;
  enablePhoneVerification?: boolean;
  enablePasswordlessLogin?: boolean;
}

export interface IOTPConfig {
  email?: IOTPEmailConfig;
  sms?: IOTPSMSConfig;
}

export interface MultiFactorConfig {
  isEnabled?: boolean;
  email?: IOTPEmailConfig;
  sms?: IOTPSMSConfig;
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
  enableSocialpay?: boolean;
  publicKey: string;
  certId: string;
}

export interface ITokiConfig {
  enableToki?: boolean;
  merchantId: string;
  apiKey: string;
  username: string;
  password: string;
  production?: boolean;
}

export enum ClientPortalHotKeyScope {
  ClientPortalSettingsPage = 'client-portal-settings-page',
  ClientPortalAddSheet = 'client-portal-add-sheet',
}
