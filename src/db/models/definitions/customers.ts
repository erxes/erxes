import { Document, Schema } from 'mongoose';

import { CUSTOMER_LEAD_STATUS_TYPES, CUSTOMER_LIFECYCLE_STATE_TYPES, STATUSES } from './constants';

import { field } from '../utils';

export interface ILocation {
  remoteAddress: string;
  country: string;
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

export interface ILink {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

interface ILinkDocument extends ILink, Document {}

export interface ICustomer {
  firstName?: string;
  lastName?: string;
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
  companyIds?: string[];
  mergedIds?: string[];
  status?: string;
  customFieldsData?: any;
  messengerData?: IMessengerData;
  location?: ILocation;
  visitorContactInfo?: IVisitorContact;
  urlVisits?: any;
  deviceTokens?: string[];
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
}

/* location schema */
const locationSchema = new Schema(
  {
    remoteAddress: String,
    country: String,
    city: String,
    region: String,
    hostname: String,
    language: String,
    userAgent: String,
  },
  { _id: false },
);

const visitorContactSchema = new Schema(
  {
    email: String,
    phone: String,
  },
  { _id: false },
);

/*
 * messenger schema
 */
const messengerSchema = new Schema(
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
    }),
  },
  { _id: false },
);

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true, label: 'LinkedIn' }),
    twitter: field({ type: String, optional: true, label: 'Twitter' }),
    facebook: field({ type: String, optional: true, label: 'Facebook' }),
    github: field({ type: String, optional: true, label: 'Github' }),
    youtube: field({ type: String, optional: true, label: 'Youtube' }),
    website: field({ type: String, optional: true, label: 'Website' }),
  },
  { _id: false },
);

export const customerSchema = new Schema({
  _id: field({ pkey: true }),

  createdAt: field({ type: Date, label: 'Created at' }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),
  avatar: field({ type: String, optional: true }),

  firstName: field({ type: String, label: 'First name', optional: true }),
  lastName: field({ type: String, label: 'Last name', optional: true }),

  primaryEmail: field({ type: String, label: 'Primary Email', optional: true }),
  emails: field({ type: [String], optional: true }),
  hasValidEmail: field({ type: Boolean, optional: true }),

  primaryPhone: field({ type: String, label: 'Primary Phone', optional: true }),
  phones: field({ type: [String], optional: true }),
  profileScore: field({ type: Number, index: true, optional: true }),

  ownerId: field({ type: String, optional: true }),
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
  links: field({ type: linkSchema, default: {} }),

  isUser: field({ type: Boolean, label: 'Is user', optional: true }),

  integrationId: field({ type: String, optional: true }),
  tagIds: field({ type: [String], optional: true, index: true }),
  companyIds: field({ type: [String], optional: true }),

  // Merged customer ids
  mergedIds: field({ type: [String], optional: true }),

  customFieldsData: field({ type: Object, optional: true }),
  messengerData: field({ type: messengerSchema, optional: true }),

  location: field({ type: locationSchema, optional: true }),

  // if customer is not a user then we will contact with this visitor using
  // this information
  visitorContactInfo: field({
    type: visitorContactSchema,
    optional: true,
    label: 'Visitor contact info',
  }),
  urlVisits: Object,

  deviceTokens: field({ type: [String], default: [] }),
});
