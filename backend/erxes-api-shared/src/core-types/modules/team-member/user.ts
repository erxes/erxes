import { Document } from 'mongoose';
import { ICustomField, ILink, IPropertyField } from '../../common';

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}
export interface IEmailSignatureDocument extends IEmailSignature, Document {}

export interface IDetail {
  avatar?: string;
  coverPhoto?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  birthDate?: Date;
  workStartedDate?: Date;
  location?: string;
  description?: string;
  operatorPhone?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
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
  code?: string;
  doNotDisturb?: string;
  isSubscribed?: string;
  sessionCode?: string;
  isShowNotification?: boolean;
  score?: number;
  customFieldsData?: ICustomField[];
  propertiesData?: IPropertyField;
  employeeId?: string;
  chatStatus?: IUserChatStatus;
  lastSeenAt?: Date;
  onboardedPlugins?: string[];
  isOnboarded?: boolean;
}

enum IUserChatStatus {
  online = 'online',
  offline = 'offline',
}

export interface IUserDocument extends Omit<IUser, 'links'>, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetail;
  role?: string;
  appId?: string;
}
