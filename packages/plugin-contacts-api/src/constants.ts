import { companySchema } from './models/definitions/companies';
import {
  customerSchema,
  locationSchema,
  visitorContactSchema
} from './models/definitions/customers';

export const MODULE_NAMES = {
  COMPANY: 'company',
  CUSTOMER: 'customer'
};

export const COC_LEAD_STATUS_TYPES = [
  '',
  'new',
  'open',
  'inProgress',
  'openDeal',
  'unqualified',
  'attemptedToContact',
  'connected',
  'badTiming'
];

export const COC_LIFECYCLE_STATE_TYPES = [
  '',
  'subscriber',
  'lead',
  'marketingQualifiedLead',
  'salesQualifiedLead',
  'opportunity',
  'customer',
  'evangelist',
  'other'
];

export const IMPORT_TYPES = [
  {
    text: 'Customers',
    contentType: 'customer',
    icon: 'users-alt',
    serviceType: 'contacts'
  },
  {
    text: 'Leads',
    contentType: 'lead',
    icon: 'file-alt',
    serviceType: 'contacts'
  },
  {
    text: 'Companies',
    contentType: 'company',
    icon: 'building',
    serviceType: 'contacts'
  }
];

export const EXPORT_TYPES = [
  {
    text: 'Customers',
    contentType: 'customer',
    icon: 'users-alt',
    serviceType: 'contacts'
  },
  {
    text: 'Leads',
    contentType: 'lead',
    icon: 'file-alt',
    serviceType: 'contacts'
  },
  {
    text: 'Companies',
    contentType: 'company',
    icon: 'building',
    serviceType: 'contacts'
  }
];

export const CUSTOMER_BASIC_INFOS = [
  'state',
  'firstName',
  'lastName',
  'middleName',
  'primaryEmail',
  'emails',
  'primaryPhone',
  'phones',
  'ownerId',
  'position',
  'department',
  'leadStatus',
  'status',
  'hasAuthority',
  'description',
  'isSubscribed',
  'integrationId',
  'code',
  'mergedIds'
];

export const COMPANY_BASIC_INFOS = [
  'primaryName',
  'names',
  'size',
  'industry',
  'website',
  'plan',
  'primaryEmail',
  'primaryPhone',
  'businessType',
  'description',
  'isSubscribed',
  'parentCompanyId'
];
export const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.COMPANY,
    schemas: [companySchema]
  },
  {
    name: MODULE_NAMES.CUSTOMER,
    schemas: [customerSchema, locationSchema, visitorContactSchema]
  }
];
