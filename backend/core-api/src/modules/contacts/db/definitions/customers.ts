import { Schema } from 'mongoose';

import {
  CUSTOMER_SELECT_OPTIONS,
  customFieldSchema,
} from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const getEnum = (fieldName: string): string[] => {
  return CUSTOMER_SELECT_OPTIONS[fieldName].map((option) => option.value);
};

export const visitorContactSchema = new Schema(
  {
    email: { type: String, label: 'Email', optional: true },
    phone: { type: String, label: 'Phone', optional: true },
  },
  { _id: false },
);

export const locationSchema = new Schema(
  {
    remoteAddress: {
      type: String,
      label: 'Remote address',
      optional: true,
    },
    country: { type: String, label: 'Country', optional: true },
    countryCode: { type: String, label: 'Country code', optional: true },
    city: { type: String, label: 'City', optional: true },
    region: { type: String, label: 'Region', optional: true },
    hostname: { type: String, label: 'Host name', optional: true },
    language: { type: String, label: 'Language', optional: true },
    userAgent: { type: String, label: 'User agent', optional: true },
  },
  { _id: false },
);

export const customerSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,

      state: {
        type: String,
        esType: 'keyword',
        label: 'State',
        default: 'visitor',
        enum: getEnum('STATE'),
        index: true,
        selectOptions: CUSTOMER_SELECT_OPTIONS.STATE,
      },

      createdAt: { type: Date, label: 'Created at', esType: 'date' },
      updatedAt: { type: Date, label: 'Modified at', esType: 'date' },
      avatar: { type: String, optional: true, label: 'Avatar' },

      firstName: { type: String, label: 'First name', optional: true },
      lastName: { type: String, label: 'Last name', optional: true },
      middleName: { type: String, label: 'Middle name', optional: true },

      birthDate: {
        type: Date,
        label: 'Date of birth',
        optional: true,
        esType: 'date',
      },
      sex: {
        type: Number,
        label: 'Pronoun',
        optional: true,
        esType: 'keyword',
        default: 0,
        enum: getEnum('SEX'),
        selectOptions: CUSTOMER_SELECT_OPTIONS.SEX,
      },

      primaryEmail: {
        type: String,
        label: 'Primary Email',
        optional: true,
        esType: 'email',
      },
      emails: { type: [String], optional: true, label: 'Emails' },
      emailValidationStatus: {
        type: String,
        enum: getEnum('EMAIL_VALIDATION_STATUSES'),
        default: 'unknown',
        label: 'Email validation status',
        esType: 'keyword',
        selectOptions: CUSTOMER_SELECT_OPTIONS.EMAIL_VALIDATION_STATUSES,
      },

      primaryPhone: {
        type: String,
        label: 'Primary Phone',
        optional: true,
      },
      phones: { type: [String], optional: true, label: 'Phones' },

      primaryAddress: {
        type: Object,
        label: 'Primary Address',
        optional: true,
      },
      addresses: { type: [Object], optional: true, label: 'Addresses' },

      phoneValidationStatus: {
        type: String,
        enum: getEnum('PHONE_VALIDATION_STATUSES'),
        default: 'unknown',
        label: 'Phone validation status',
        esType: 'keyword',
        selectOptions: CUSTOMER_SELECT_OPTIONS.PHONE_VALIDATION_STATUSES,
      },

      status: {
        type: String,
        enum: getEnum('STATUSES'),
        optional: true,
        label: 'Status',
        default: 'Active',
        esType: 'keyword',
        index: true,
        selectOptions: CUSTOMER_SELECT_OPTIONS.STATUSES,
      },

      description: { type: String, optional: true, label: 'Description' },
      doNotDisturb: {
        type: String,
        optional: true,
        default: 'No',
        enum: getEnum('DO_NOT_DISTURB'),
        label: 'Do not disturb',
        selectOptions: CUSTOMER_SELECT_OPTIONS.DO_NOT_DISTURB,
      },
      isSubscribed: {
        type: String,
        optional: true,
        default: 'Yes',
        enum: getEnum('DO_NOT_DISTURB'),
        label: 'Subscribed',
        selectOptions: CUSTOMER_SELECT_OPTIONS.DO_NOT_DISTURB,
      },
      links: { type: Object, default: {}, label: 'Links' },
      code: { type: String, label: 'Code', optional: true },
      tagIds: {
        type: [String],
        optional: true,
        index: true,
        label: 'Tags',
      },
      searchText: { type: String, optional: true },

      ownerId: { type: String, optional: true },
      position: {
        type: String,
        optional: true,
        label: 'Position',
        esType: 'keyword',
      },
      department: { type: String, optional: true, label: 'Department' },

      leadStatus: {
        type: String,
        enum: getEnum('LEAD_STATUS_TYPES'),
        optional: true,
        label: 'Lead Status',
        esType: 'keyword',
        selectOptions: CUSTOMER_SELECT_OPTIONS.LEAD_STATUS_TYPES,
      },
      hasAuthority: {
        type: String,
        optional: true,
        default: 'No',
        label: 'Has authority',
        enum: getEnum('HAS_AUTHORITY'),
        selectOptions: CUSTOMER_SELECT_OPTIONS.HAS_AUTHORITY,
      },
      relatedIntegrationIds: {
        type: [String],
        label: 'Related integrations',
        esType: 'keyword',
        optional: true,
      },
      integrationId: {
        type: String,
        optional: true,
        label: 'Integration',
        index: true,
        esType: 'keyword',
      },

      // Merged customer ids
      mergedIds: { type: [String], optional: true },

      trackedData: {
        type: [customFieldSchema],
        optional: true,
        label: 'Tracked Data',
      },
      customFieldsData: {
        type: [customFieldSchema],
        optional: true,
        label: 'Custom fields data',
      },

      location: {
        type: locationSchema,
        optional: true,
        label: 'Location',
      },

      // if customer is not a user then we will contact with this visitor using
      // this information
      visitorContactInfo: {
        type: visitorContactSchema,
        optional: true,
        label: 'Visitor contact info',
      },

      deviceTokens: { type: [String], default: [] },

      isOnline: {
        type: Boolean,
        label: 'Is online',
        optional: true,
      },
      lastSeenAt: {
        type: Date,
        label: 'Last seen at',
        optional: true,
        esType: 'date',
      },
      sessionCount: {
        type: Number,
        label: 'Session count',
        optional: true,
        esType: 'number',
      },
      visitorId: { type: String, optional: true },
      data: { type: Object, optional: true },
    },
    {
      timestamps: true,
    },
  ),
  { contentType: 'core:customer' },
);

customerSchema.index({ _id: 1, createdAt: 1, searchText: 1 });
