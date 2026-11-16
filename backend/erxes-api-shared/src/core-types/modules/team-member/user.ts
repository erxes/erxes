import { Document } from 'mongoose';
import { ICustomField, ILink, IPropertyField } from '../../common';

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}
export interface IEmailSignatureDocument extends IEmailSignature, Document {}

export interface ICustomPermission {
  plugin?: string;
  module: string;
  actions: string[];
  scope: 'own' | 'group' | 'all';
}

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

// Per-user UI layout choice; theme (light/dark) stays per browser.
export interface IUserAppearance {
  layout?: string;
  frameColor?: string;
  // Which edge of the frame the navigation sits on: start is top (notch) or
  // left (sidebar), end is bottom or right.
  navPosition?: string;
}

/**
 * Whether a member takes new work, as they or a manager declared it. Absent
 * means not declared; `until` ends the declaration without a job.
 */
export interface IUserAvailability {
  status?: 'available' | 'unavailable';
  until?: Date;
  reason?: string;
  setBy?: string;
  setAt?: Date;
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
  appearance?: IUserAppearance;
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
  dataExtensions?: Record<string, unknown>;
  departmentIds?: string[];
  branchIds?: string[];
  positionIds?: string[];
  employeeId?: string;
  chatStatus?: IUserChatStatus;
  availability?: IUserAvailability;
  lastSeenAt?: Date;
  onboardedPlugins?: string[];
  isOnboarded?: boolean;
  permissionGroupIds?: string[];
  customPermissions?: ICustomPermission[];
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
export interface IUserMovementDocument extends Document {
  _id: string;
  contentType: string;
  contentTypeId: string;
  userId: string;
  createdAt: string;
  createdBy: string;
  status: string;
  isActive: boolean;
}
