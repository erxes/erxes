import { Document, Schema } from 'mongoose';

import { field } from './utils';
import {
  IMailConfig,
  IManualVerificationConfig,
  IOTPConfig,
  IPasswordVerificationConfig
} from './clientPortal';

export interface IVendorPortal {
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  url: string;

  // auth
  tokenExpiration?: number;
  refreshTokenExpiration?: number;
  tokenPassMethod?: 'cookie' | 'header';

  otpConfig?: IOTPConfig;
  mailConfig?: IMailConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  passwordVerificationConfig?: IPasswordVerificationConfig;

  googleCredentials?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;

  // product
}
