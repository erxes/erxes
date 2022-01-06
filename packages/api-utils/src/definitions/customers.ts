import { Document } from 'mongoose';
import { ICustomField, ILink } from './common';

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface IVisitorContactDocument extends IVisitorContact, Document {}

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

export interface ILocationDocument extends ILocation, Document {}

export interface ICustomer {
  state?: 'visitor' | 'lead' | 'customer';

  scopeBrandIds?: string[];
  firstName?: string;
  lastName?: string;
  middleName?: string;
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
  isSubscribed?: string;
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
  visitorId?: string;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
  location?: ILocationDocument;
  visitorContactInfo?: IVisitorContactDocument;
  profileScore?: number;
  score?: number;
  status?: string;
  createdAt: Date;
  modifiedAt: Date;
  deviceTokens?: string[];
  searchText?: string;
}
