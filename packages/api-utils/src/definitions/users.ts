import { Document } from 'mongoose';

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
  operatorPhone?: string;
}

export interface IDetailDocument extends IDetail, Document {}

export interface ILink {
  [key: string]: string;
}

export interface IUser {
  createdAt?: Date;
  username?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOwner?: boolean;
  email?: string;
  getNotificationByEmail?: boolean;
  emailSignatures?: IEmailSignature[];
  starredConversationIds?: string[];
  details?: IDetail;
  links?: ILink;
  isActive?: boolean;
  brandIds?: string[];
  groupIds?: string[];
  deviceTokens?: string[];
  doNotDisturb?: string;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetailDocument;
}
