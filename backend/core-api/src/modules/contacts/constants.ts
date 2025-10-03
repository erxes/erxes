import { STATUSES } from 'erxes-api-shared/utils';

export const AWS_EMAIL_STATUSES = {
  SEND: 'send',
  DELIVERY: 'delivery',
  OPEN: 'open',
  CLICK: 'click',
  COMPLAINT: 'complaint',
  BOUNCE: 'bounce',
  RENDERING_FAILURE: 'renderingfailure',
  REJECT: 'reject',
};

export const EMAIL_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  ACCEPT_ALL_UNVERIFIABLE: 'accept_all_unverifiable',
  UNVERIFIABLE: 'unverifiable',
  UNKNOWN: 'unknown',
  DISPOSABLE: 'disposable',
  CATCH_ALL: 'catchall',
  BAD_SYNTAX: 'badsyntax',
};

export const COMPANY_SELECT_OPTIONS = {
  BUSINESS_TYPES: [
    { label: 'Competitor', value: 'Competitor' },
    { label: 'Customer', value: 'Customer' },
    { label: 'Investor', value: 'Investor' },
    { label: 'Partner', value: 'Partner' },
    { label: 'Press', value: 'Press' },
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Reseller', value: 'Reseller' },
    { label: 'Other', value: 'Other' },
    { label: 'Unknown', value: '' },
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' },
  ],
};

export const COC_LIFECYCLE_STATE_TYPES = [
  '',
  'subscriber',
  'lead',
  'marketingQualifiedLead',
  'salesQualifiedLead',
  'opportunity',
  'customer',
  'evangelist',
  'other',
];

export const CONTACT_STATUSES = {
  active: 'Active',
  deleted: 'deleted',
};
