import { Document, Schema } from 'mongoose';

import { customFieldSchema, ICustomField, ILink } from './common';
import { CUSTOMER_SELECT_OPTIONS } from './constants';

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

export interface IValidationResponse {
  email?: string;
  phone?: string;
  status: string;
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

/* location schema */
export const locationSchema = new Schema(
  {
    remoteAddress: field({
      type: String,
      label: 'Remote address',
      optional: true
    }),
    country: field({ type: String, label: 'Country', optional: true }),
    countryCode: field({ type: String, label: 'Country code', optional: true }),
    city: field({ type: String, label: 'City', optional: true }),
    region: field({ type: String, label: 'Region', optional: true }),
    hostname: field({ type: String, label: 'Host name', optional: true }),
    language: field({ type: String, label: 'Language', optional: true }),
    userAgent: field({ type: String, label: 'User agent', optional: true })
  },
  { _id: false }
);

export const visitorContactSchema = new Schema(
  {
    email: field({ type: String, label: 'Email', optional: true }),
    phone: field({ type: String, label: 'Phone', optional: true })
  },
  { _id: false }
);

const getEnum = (fieldName: string): string[] => {
  return CUSTOMER_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export const customerSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    state: field({
      type: String,
      esType: 'keyword',
      label: 'State',
      default: 'visitor',
      enum: getEnum('STATE'),
      index: true,
      selectOptions: CUSTOMER_SELECT_OPTIONS.STATE
    }),

    createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
    modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' }),
    avatar: field({ type: String, optional: true, label: 'Avatar' }),

    firstName: field({ type: String, label: 'First name', optional: true }),
    lastName: field({ type: String, label: 'Last name', optional: true }),
    middleName: field({ type: String, label: 'Middle name', optional: true }),

    birthDate: field({
      type: Date,
      label: 'Date of birth',
      optional: true,
      esType: 'date'
    }),
    sex: field({
      type: Number,
      label: 'Pronoun',
      optional: true,
      esType: 'keyword',
      default: 0,
      enum: getEnum('SEX'),
      selectOptions: CUSTOMER_SELECT_OPTIONS.SEX
    }),

    primaryEmail: field({
      type: String,
      label: 'Primary Email',
      optional: true,
      esType: 'email'
    }),
    emails: field({ type: [String], optional: true, label: 'Emails' }),
    emailValidationStatus: field({
      type: String,
      enum: getEnum('EMAIL_VALIDATION_STATUSES'),
      default: 'unknown',
      label: 'Email validation status',
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.EMAIL_VALIDATION_STATUSES
    }),

    primaryPhone: field({
      type: String,
      label: 'Primary Phone',
      optional: true
    }),
    phones: field({ type: [String], optional: true, label: 'Phones' }),

    phoneValidationStatus: field({
      type: String,
      enum: getEnum('PHONE_VALIDATION_STATUSES'),
      default: 'unknown',
      label: 'Phone validation status',
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.PHONE_VALIDATION_STATUSES
    }),
    profileScore: field({
      type: Number,
      index: true,
      optional: true,
      esType: 'number'
    }),

    score: field({
      type: Number,
      optional: true,
      label: 'Score',
      esType: 'number'
    }),

    ownerId: field({ type: String, optional: true }),
    position: field({
      type: String,
      optional: true,
      label: 'Position',
      esType: 'keyword'
    }),
    department: field({ type: String, optional: true, label: 'Department' }),

    leadStatus: field({
      type: String,
      enum: getEnum('LEAD_STATUS_TYPES'),
      optional: true,
      label: 'Lead Status',
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.LEAD_STATUS_TYPES
    }),

    status: field({
      type: String,
      enum: getEnum('STATUSES'),
      optional: true,
      label: 'Status',
      default: 'Active',
      esType: 'keyword',
      index: true,
      selectOptions: CUSTOMER_SELECT_OPTIONS.STATUSES
    }),

    hasAuthority: field({
      type: String,
      optional: true,
      default: 'No',
      label: 'Has authority',
      enum: getEnum('HAS_AUTHORITY'),
      selectOptions: CUSTOMER_SELECT_OPTIONS.HAS_AUTHORITY
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    doNotDisturb: field({
      type: String,
      optional: true,
      default: 'No',
      enum: getEnum('DO_NOT_DISTURB'),
      label: 'Do not disturb',
      selectOptions: CUSTOMER_SELECT_OPTIONS.DO_NOT_DISTURB
    }),
    isSubscribed: field({
      type: String,
      optional: true,
      default: 'Yes',
      enum: getEnum('DO_NOT_DISTURB'),
      label: 'Subscribed',
      selectOptions: CUSTOMER_SELECT_OPTIONS.DO_NOT_DISTURB
    }),
    links: field({ type: Object, default: {}, label: 'Links' }),

    relatedIntegrationIds: field({
      type: [String],
      label: 'Related integrations',
      esType: 'keyword',
      optional: true
    }),
    integrationId: field({
      type: String,
      optional: true,
      label: 'Integration',
      index: true,
      esType: 'keyword'
    }),
    tagIds: field({
      type: [String],
      optional: true,
      index: true,
      label: 'Tags'
    }),

    // Merged customer ids
    mergedIds: field({ type: [String], optional: true }),

    trackedData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Tracked Data'
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),

    location: field({
      type: locationSchema,
      optional: true,
      label: 'Location'
    }),

    // if customer is not a user then we will contact with this visitor using
    // this information
    visitorContactInfo: field({
      type: visitorContactSchema,
      optional: true,
      label: 'Visitor contact info'
    }),

    deviceTokens: field({ type: [String], default: [] }),
    searchText: field({ type: String, optional: true, index: true }),
    code: field({ type: String, label: 'Code', optional: true }),

    isOnline: field({
      type: Boolean,
      label: 'Is online',
      optional: true
    }),
    lastSeenAt: field({
      type: Date,
      label: 'Last seen at',
      optional: true,
      esType: 'date'
    }),
    sessionCount: field({
      type: Number,
      label: 'Session count',
      optional: true,
      esType: 'number'
    }),
    visitorId: field({ type: String, optional: true }),
  })
);
