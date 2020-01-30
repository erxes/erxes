import { Document, Schema } from 'mongoose';

import { ILink, linkSchema } from './common';
import { CUSTOMER_LEAD_STATUS_TYPES, CUSTOMER_LIFECYCLE_STATE_TYPES, STATUSES } from './constants';

import { field, schemaWrapper } from './utils';

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

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface IVisitorContactDocument extends IVisitorContact, Document {}

export interface IMessengerData {
  lastSeenAt?: number;
  sessionCount?: number;
  isActive?: boolean;
  customData?: any;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

interface ILinkDocument extends ILink, Document {}

export interface ICustomer {
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
  lifecycleState?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  hasValidEmail?: boolean;
  links?: ILink;
  isUser?: boolean;
  integrationId?: string;
  tagIds?: string[];
  // TODO migrate after remove 1row
  companyIds?: string[];
  mergedIds?: string[];
  status?: string;
  customFieldsData?: any;
  messengerData?: IMessengerData;
  location?: ILocation;
  visitorContactInfo?: IVisitorContact;
  urlVisits?: any;
  deviceTokens?: string[];
  code?: string;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
  messengerData?: IMessengerDataDocument;
  location?: ILocationDocument;
  links?: ILinkDocument;
  visitorContactInfo?: IVisitorContactDocument;
  profileScore?: number;
  status?: string;
  createdAt: Date;
  modifiedAt: Date;
  deviceTokens?: string[];
  searchText?: string;
}

/* location schema */
export const locationSchema = new Schema(
  {
    remoteAddress: field({ type: String, label: 'Remote address' }),
    country: field({ type: String, label: 'Country' }),
    countryCode: field({ type: String, label: 'Country code' }),
    city: field({ type: String, label: 'City' }),
    region: field({ type: String, label: 'Region' }),
    hostname: field({ type: String, label: 'Host name' }),
    language: field({ type: String, label: 'Language' }),
    userAgent: field({ type: String, label: 'User agent' }),
  },
  { _id: false },
);

export const visitorContactSchema = new Schema(
  {
    email: field({ type: String, label: 'Email' }),
    phone: field({ type: String, label: 'Phone' }),
  },
  { _id: false },
);

/*
 * messenger schema
 */
export const messengerSchema = new Schema(
  {
    lastSeenAt: field({
      type: Date,
      label: 'Last seen at',
    }),
    sessionCount: field({
      type: Number,
      label: 'Session count',
    }),
    isActive: field({
      type: Boolean,
      label: 'Is online',
    }),
    customData: field({
      type: Object,
      optional: true,
      label: 'Custom data',
    }),
  },
  { _id: false },
);

export const customerSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    avatar: field({ type: String, optional: true, label: 'Avatar' }),

    firstName: field({ type: String, label: 'First name', optional: true }),
    lastName: field({ type: String, label: 'Last name', optional: true }),
    birthDate: field({ type: Date, label: 'Date of birth', optional: true }),
    sex: field({ type: Number, label: 'Sex', optional: true, default: 0 }),

    primaryEmail: field({ type: String, label: 'Primary Email', optional: true }),
    emails: field({ type: [String], optional: true, label: 'Emails' }),
    hasValidEmail: field({ type: Boolean, optional: true, label: 'Has valid email' }),

    primaryPhone: field({ type: String, label: 'Primary Phone', optional: true }),
    phones: field({ type: [String], optional: true, label: 'Phones' }),
    profileScore: field({ type: Number, index: true, optional: true, label: 'Profile score' }),

    ownerId: field({ type: String, optional: true, label: 'Owner' }),
    position: field({ type: String, optional: true, label: 'Position' }),
    department: field({ type: String, optional: true, label: 'Department' }),

    leadStatus: field({
      type: String,
      enum: CUSTOMER_LEAD_STATUS_TYPES,
      optional: true,
      label: 'Lead Status',
    }),

    status: field({
      type: String,
      enum: STATUSES.ALL,
      default: STATUSES.ACTIVE,
      optional: true,
      label: 'Status',
      index: true,
    }),

    lifecycleState: field({
      type: String,
      enum: CUSTOMER_LIFECYCLE_STATE_TYPES,
      optional: true,
      label: 'Lifecycle State',
    }),

    hasAuthority: field({ type: String, optional: true, label: 'Has authority' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    doNotDisturb: field({
      type: String,
      optional: true,
      label: 'Do not disturb',
    }),
    links: field({ type: linkSchema, default: {}, label: 'Links' }),

    isUser: field({ type: Boolean, label: 'Is user', optional: true }),

    integrationId: field({ type: String, optional: true, label: 'Integration' }),
    tagIds: field({ type: [String], optional: true, index: true, label: 'Tags' }),

    // Merged customer ids
    mergedIds: field({ type: [String], optional: true, label: 'Merged customers' }),

    customFieldsData: field({ type: Object, optional: true, label: 'Custom fields' }),
    messengerData: field({ type: messengerSchema, optional: true, label: 'Messenger data' }),

    location: field({ type: locationSchema, optional: true, label: 'Location' }),

    // if customer is not a user then we will contact with this visitor using
    // this information
    visitorContactInfo: field({
      type: visitorContactSchema,
      optional: true,
      label: 'Visitor contact info',
    }),
    urlVisits: Object,

    deviceTokens: field({ type: [String], default: [], label: 'Device tokens' }),
    searchText: field({ type: String, optional: true, index: true }),
    code: field({ type: String, label: 'Code', optional: true }),
  }),
);
