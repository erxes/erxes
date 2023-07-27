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
}

export interface IVendorPortalDocument extends IVendorPortal, Document {
  _id: string;
  createdAt?: Date;
}

export const vendorPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, index: true }),
  description: field({ type: String }),
  logo: field({ type: String }),
  url: field({ type: String }),

  // auth
  tokenExpiration: field({ type: Number }),
  refreshTokenExpiration: field({ type: Number }),
  tokenPassMethod: field({ type: String }),

  otpConfig: field({ type: Object }),
  mailConfig: field({ type: Object }),
  manualVerificationConfig: field({ type: Object }),
  passwordVerificationConfig: field({ type: Object }),

  googleCredentials: field({ type: String }),
  googleClientId: field({ type: String }),
  googleClientSecret: field({ type: String }),
  googleRedirectUri: field({ type: String }),

  createdAt: field({ type: Date, default: Date.now })
});
