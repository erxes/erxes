import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IVendorUser {
  vendorPortalId: string;
  companyId: string;
  role: 'owner' | 'manager' | 'staff';

  // auth
  username: string;
  password: string;
  email: string;
  phone: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;

  // personal info
  firstName: string;
  lastName: string;
  avatar: string;

  createdAt?: Date;
  deviceTokens?: string[];
}

export interface IVendorUserDocument extends IVendorUser, Document {
  _id: string;
}

export const vendorUserSchema = new Schema({
  _id: field({ pkey: true }),
  vendorPortalId: field({ type: String, index: true }),
  companyId: field({ type: String, index: true }),
  role: field({ type: String, index: true }),

  // auth
  username: field({ type: String, index: true }),
  password: field({ type: String }),
  email: field({ type: String, index: true }),
  phone: field({ type: String, index: true }),
  resetPasswordToken: field({ type: String }),
  resetPasswordExpires: field({ type: Date }),
  registrationToken: field({ type: String }),
  registrationTokenExpires: field({ type: Date }),

  // personal info
  firstName: field({ type: String }),
  lastName: field({ type: String }),
  avatar: field({ type: String }),

  createdAt: field({ type: Date }),
  deviceTokens: field({ type: [String], default: [] })
});

vendorUserSchema.index(
  { vendorPortalId: 1, companyId: 1, username: 1, email: 1, phone: 1 },
  { unique: true }
);
