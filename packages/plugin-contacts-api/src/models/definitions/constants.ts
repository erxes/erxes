import { STATUSES, DEFAULT_SEX_CHOICES } from '@erxes/api-utils/src/constants';

export const ACTIVITY_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  ALL: ['customer', 'company']
};

export { STATUSES, DEFAULT_SEX_CHOICES };

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
    { label: 'Unknown', value: '' }
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ]
};

export const CUSTOMER_SELECT_OPTIONS = {
  SEX: [
    ...DEFAULT_SEX_CHOICES,
    { label: 'co/co', value: 10 },
    { label: 'en/en', value: 11 },
    { label: 'ey/em', value: 12 },
    { label: 'he/him', value: 13 },
    { label: 'he/them', value: 14 },
    { label: 'she/her', value: 15 },
    { label: 'she/them', value: 16 },
    { label: 'they/them', value: 17 },
    { label: 'xie/hir', value: 18 },
    { label: 'yo/yo', value: 19 },
    { label: 'ze/zir', value: 20 },
    { label: 've/vis', value: 21 },
    { label: 'xe/xem', value: 22 }
  ],
  EMAIL_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
    { label: 'Unverifiable', value: 'unverifiable' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Disposable', value: 'disposable' },
    { label: 'Catch all', value: 'catchall' },
    { label: 'Bad syntax', value: 'badsyntax' }
  ],
  PHONE_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Can receive sms', value: 'receives_sms' },
    { label: 'Unverifiable', value: 'unverifiable' }
  ],
  LEAD_STATUS_TYPES: [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'attemptedToContact' },
    { label: 'Working', value: 'inProgress' },
    { label: 'Bad Timing', value: 'badTiming' },
    { label: 'Unqualified', value: 'unqualified' },
    { label: 'Unknown', value: '' }
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  HAS_AUTHORITY: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  STATE: [
    { label: 'Visitor', value: 'visitor' },
    { label: 'Lead', value: 'lead' },
    { label: 'Customer', value: 'customer' }
  ]
};

export const TAG_TYPES = {
  CUSTOMER: 'contacts:customer',
  COMPANY: 'contacts:company'
};
