import { companySchema } from "./models/definitions/companies";
import { customerSchema, locationSchema, visitorContactSchema } from "./models/definitions/customers";

export const MODULE_NAMES = {
  COMPANY: 'company',
  CUSTOMER: 'customer',
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
