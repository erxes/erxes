import { Document } from 'mongoose';

export interface IBrandEmailConfig {
  type?: string;
  template?: string;
}

interface IBrandEmailConfigDocument extends IBrandEmailConfig, Document {}

export interface IBrand {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  emailConfig?: IBrandEmailConfig;
}

export interface IBrandDocument extends IBrand, Document {
  _id: string;
  emailConfig?: IBrandEmailConfigDocument;
  createdAt: Date;
}

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

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export interface ILocation {
  remoteAddress: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
}

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface IVisitorContactDocument extends IVisitorContact, Document {}

export interface ICustomer {
  state?: 'visitor' | 'lead' | 'customer';

  scopeBrandIds?: string[];
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  sex?: number;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  primaryPhone?: string;
  phones?: string[];

  ownerId?: string;
  position?: string;
  department?: string;
  leadStatus?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  emailValidationStatus?: string;
  phoneValidationStatus?: string;
  links?: ILink;
  relatedIntegrationIds?: string[];
  integrationId?: string;
  tagIds?: string[];

  // TODO migrate after remove 1row
  companyIds?: string[];

  mergedIds?: string[];
  status?: string;
  customFieldsData?: ICustomField[];
  trackedData?: ICustomField[];
  location?: ILocation;
  visitorContactInfo?: IVisitorContact;
  deviceTokens?: string[];
  code?: string;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
}
