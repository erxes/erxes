import { Document, Schema } from 'mongoose';

import {
  customFieldSchema,
  ICustomField,
  ILink
} from '@erxes/api-utils/src/definitions/common';
import { COMPANY_SELECT_OPTIONS } from './constants';

import { field, schemaWrapper } from '@erxes/api-utils/src/definitions/utils';
import { IAddress } from './customers';

export interface ICompany {
  scopeBrandIds?: string[];
  primaryName?: string;
  avatar?: string;
  names?: string[];
  size?: number;
  industry?: string;
  plan?: string;
  parentCompanyId?: string;

  primaryEmail?: string;
  emails?: string[];
  primaryAddress?: IAddress;
  addresses?: IAddress[];

  ownerId?: string;

  primaryPhone?: string;
  phones?: string[];

  mergedIds?: string[];
  status?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  isSubscribed?: string;
  links?: ILink;
  tagIds?: string[];
  customFieldsData?: ICustomField[];
  trackedData?: ICustomField[];
  website?: string;
  code?: string;
  location?: string;
}

export interface ICompanyDocument extends ICompany, Document {
  _id: string;
  status?: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
  score?: number;
}

const getEnum = (fieldName: string): string[] => {
  return COMPANY_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export const companySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
    modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' }),

    primaryName: field({
      type: String,
      label: 'Name',
      optional: true,
      esType: 'keyword'
    }),

    names: field({
      type: [String],
      optional: true,
      label: 'Names'
    }),

    avatar: field({
      type: String,
      optional: true,
      label: 'Avatar'
    }),

    size: field({
      type: Number,
      label: 'Size',
      optional: true,
      esType: 'number'
    }),

    industry: field({
      type: String,
      label: 'Industries',
      optional: true,
      esType: 'keyword'
    }),

    website: field({
      type: String,
      label: 'Website',
      optional: true
    }),

    plan: field({
      type: String,
      label: 'Plan',
      optional: true
    }),

    parentCompanyId: field({
      type: String,
      optional: true,
      label: 'Parent Company'
    }),

    primaryEmail: field({
      type: String,
      optional: true,
      label: 'Primary email',
      esType: 'email'
    }),
    emails: field({ type: [String], optional: true, label: 'Emails' }),

    primaryPhone: field({
      type: String,
      optional: true,
      label: 'Primary phone'
    }),
    phones: field({ type: [String], optional: true, label: 'Phones' }),

    primaryAddress: field({
      type: Object,
      label: 'Primary Address',
      optional: true
    }),
    addresses: field({ type: [Object], optional: true, label: 'Addresses' }),

    ownerId: field({ type: String, optional: true }),

    status: field({
      type: String,
      enum: getEnum('STATUSES'),
      default: 'Active',
      optional: true,
      label: 'Status',
      esType: 'keyword',
      selectOptions: COMPANY_SELECT_OPTIONS.STATUSES
    }),

    businessType: field({
      type: String,
      enum: getEnum('BUSINESS_TYPES'),
      optional: true,
      label: 'Business Type',
      esType: 'keyword',
      selectOptions: COMPANY_SELECT_OPTIONS.BUSINESS_TYPES
    }),

    description: field({ type: String, optional: true, label: 'Description' }),
    employees: field({ type: Number, optional: true, label: 'Employees' }),
    doNotDisturb: field({
      type: String,
      optional: true,
      default: 'No',
      enum: getEnum('DO_NOT_DISTURB'),
      label: 'Do not disturb',
      selectOptions: COMPANY_SELECT_OPTIONS.DO_NOT_DISTURB
    }),
    isSubscribed: field({
      type: String,
      optional: true,
      default: 'Yes',
      enum: getEnum('DO_NOT_DISTURB'),
      label: 'Subscribed',
      selectOptions: COMPANY_SELECT_OPTIONS.DO_NOT_DISTURB
    }),
    links: field({ type: Object, default: {}, label: 'Links' }),

    tagIds: field({
      type: [String],
      optional: true,
      label: 'Tags',
      index: true
    }),

    // Merged company ids
    mergedIds: field({
      type: [String],
      optional: true,
      label: 'Merged companies'
    }),

    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),

    trackedData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Tracked Data'
    }),
    searchText: field({ type: String, optional: true, index: true }),
    code: field({ type: String, label: 'Code', optional: true }),
    location: field({ type: String, optional: true, label: 'Location' }),
    score: field({
      type: Number,
      optional: true,
      label: 'Score',
      esType: 'number'
    })
  })
);
