export const connectors = {
  any: 'any',
  all: 'all'
};

export const types = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date'
};

export const operators = {
  string: [
    { name: 'equals', value: 'e' },
    { name: 'does not equal', value: 'dne' },
    { name: 'contains', value: 'c' },
    { name: 'does not contain', value: 'dnc' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  number: [
    { name: 'is greater than', value: 'igt' },
    { name: 'equals to', value: 'et' },
    { name: 'is less than', value: 'ilt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  boolean: [
    { name: 'is true', value: 'it', noInput: true },
    { name: 'is false', value: 'if', noInput: true },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  date: [
    { name: 'was less than', value: 'wlt' },
    { name: 'was more than', value: 'wmt' },
    { name: 'will occur within', value: 'wow' },
    { name: 'will occur after', value: 'woa' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ]
};

export const dateUnits = {
  days: 'days',
  weeks: 'weeks',
  months: 'months'
};

export const CUSTOMER_BASIC_INFO = {
  firstName: 'First Name',
  lastName: 'Last Name',
  primaryEmail: 'Primary E-mail',
  primaryPhone: 'Primary Phone',
  position: 'Position',
  department: 'Department',
  leadStatus: 'Lead Status',
  lifecycleState: 'Lifecycle state',
  hasAuthority: 'Has Authority',
  description: 'Description',
  doNotDisturb: 'Do not disturb'
};

export const CUSTOMER_DATAS = {
  messengerData: 'Messenger Data',
  twitterData: 'Twitter Data',
  facebookData: 'Facebook Data',
  visitorContactInfo: 'Visitor contact info'
};

export const CUSTOMER_LEAD_STATUS_TYPES = [
  '',
  'New',
  'Open',
  'In Progress',
  'Open Deal',
  'Unqualified',
  'Attempted to contact',
  'Connected',
  'Bad Timing'
];

export const CUSTOMER_LIFECYCLE_STATE_TYPES = [
  '',
  'Subscriber',
  'Lead',
  'Marketing Qualified Lead',
  'Sales Qualified Lead',
  'Opportunity',
  'Customer',
  'Evangelist',
  'Other'
];
