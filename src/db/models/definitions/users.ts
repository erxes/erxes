import { Document, Schema } from 'mongoose';
import { field } from '../utils';

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}

export interface IEmailSignatureDocument extends IEmailSignature, Document {}

export interface IDetail {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  location?: string;
  description?: string;
}

export interface IDetailDocument extends IDetail, Document {}

export interface ILink {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

interface ILinkDocument extends ILink, Document {}

export interface IUser {
  username?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOwner?: boolean;
  hasSeenOnBoard?: boolean;
  email?: string;
  getNotificationByEmail?: boolean;
  emailSignatures?: IEmailSignature[];
  starredConversationIds?: string[];
  details?: IDetail;
  links?: ILink;
  isActive?: boolean;
  groupIds?: string[];
  deviceTokens?: string[];
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetailDocument;
  links?: ILinkDocument;
  groupIds?: string[];
  deviceTokens?: string[];
}

// Mongoose schemas ===============================
const emailSignatureSchema = new Schema(
  {
    brandId: field({ type: String }),
    signature: field({ type: String }),
  },
  { _id: false },
);

// Detail schema
const detailSchema = new Schema(
  {
    avatar: field({ type: String }),
    shortName: field({ type: String, optional: true }),
    fullName: field({ type: String }),
    position: field({ type: String }),
    location: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
  },
  { _id: false },
);

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true }),
    twitter: field({ type: String, optional: true }),
    facebook: field({ type: String, optional: true }),
    github: field({ type: String, optional: true }),
    youtube: field({ type: String, optional: true }),
    website: field({ type: String, optional: true }),
  },
  { _id: false },
);

// User schema
export const userSchema = new Schema({
  _id: field({ pkey: true }),
  username: field({ type: String }),
  password: field({ type: String }),
  resetPasswordToken: field({ type: String }),
  registrationToken: field({ type: String }),
  registrationTokenExpires: field({ type: Date }),
  resetPasswordExpires: field({ type: Date }),
  isOwner: field({ type: Boolean }),
  hasSeenOnBoard: field({ type: Boolean }),
  email: field({
    type: String,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  }),
  getNotificationByEmail: field({ type: Boolean }),
  emailSignatures: field({ type: [emailSignatureSchema] }),
  starredConversationIds: field({ type: [String] }),
  details: field({ type: detailSchema, default: {} }),
  links: field({ type: linkSchema, default: {} }),
  isActive: field({ type: Boolean, default: true }),
  groupIds: field({ type: [String] }),
  deviceTokens: field({ type: [String], default: [] }),
});
