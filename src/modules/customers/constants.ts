export const connectors = {
  all: 'all',
  any: 'any'
};

export const types = {
  boolean: 'Boolean',
  date: 'Date',
  number: 'Number',
  string: 'String'
};

export const operators = {
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
  ],
  number: [
    { name: 'is greater than', value: 'igt' },
    { name: 'equals to', value: 'et' },
    { name: 'is less than', value: 'ilt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  string: [
    { name: 'equals', value: 'e' },
    { name: 'does not equal', value: 'dne' },
    { name: 'contains', value: 'c' },
    { name: 'does not contain', value: 'dnc' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ]
};

export const dateUnits = {
  days: 'days',
  months: 'months',
  weeks: 'weeks'
};

export const CUSTOMER_BASIC_INFO = {
  avatar: 'Avatar',
  department: 'Department',
  description: 'Description',
  doNotDisturb: 'Do not disturb',
  firstName: 'First Name',
  hasAuthority: 'Has Authority',
  lastName: 'Last Name',
  leadStatus: 'Lead Status',
  lifecycleState: 'Lifecycle state',
  position: 'Position',
  primaryEmail: 'Primary E-mail',
  primaryPhone: 'Primary Phone',

  ALL: [
    { field: 'avatar', label: 'Avatar' },
    { field: 'firstName', label: 'First Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'primaryEmail', label: 'Primary E-mail' },
    { field: 'primaryPhone', label: 'Primary Phone' },
    { field: 'position', label: 'Position' },
    { field: 'department', label: 'Department' },
    { field: 'leadStatus', label: 'Lead Status' },
    { field: 'lifecycleState', label: 'Lifecycle state' },
    { field: 'hasAuthority', label: 'Has Authority' },
    { field: 'description', label: 'Description' },
    { field: 'doNotDisturb', label: 'Do not disturb' }
  ]
};

export const CUSTOMER_DATAS = {
  facebookData: 'Facebook Data',
  links: 'Links',
  messengerData: 'Messenger Data',
  owner: 'Owner',
  twitterData: 'Twitter Data',
  visitorContactInfo: 'Visitor contact info',

  ALL: [
    { field: 'messengerData', label: 'Messenger Data' },
    { field: 'twitterData', label: 'Twitter Data' },
    { field: 'facebookData', label: 'Facebook Data' },
    { field: 'visitorContactInfo', label: 'Visitor contact info' },
    { field: 'owner', label: 'Owner' },
    { field: 'links', label: 'Links' }
  ]
};

export const LEAD_STATUS_TYPES = {
  '': '',
  attemptedToContact: 'Attempted to contact',
  badTiming: 'Bad Timing',
  connected: 'Connected',
  inProgress: 'In Progress',
  new: 'New',
  open: 'Open',
  openDeal: 'Open Deal',
  unqualified: 'Unqualified'
};

export const LIFECYCLE_STATE_TYPES = {
  '': '',
  customer: 'Customer',
  evangelist: 'Evangelist',
  lead: 'Lead',
  marketingQualifiedLead: 'Marketing Qualified Lead',
  opportunity: 'Opportunity',
  other: 'Other',
  salesQualifiedLead: 'Sales Qualified Lead',
  subscriber: 'Subscriber'
};

export const CUSTOMER_LINKS = {
  facebook: 'Facebook',
  github: 'Github',
  linkedIn: 'LinkedIn',
  twitter: 'Twitter',
  website: 'Website',
  youtube: 'Youtube',

  ALL: [
    { field: 'linkedIn', label: 'LinkedIn' },
    { field: 'twitter', label: 'Twitter' },
    { field: 'facebook', label: 'Facebook' },
    { field: 'youtube', label: 'Youtube' },
    { field: 'github', label: 'Github' },
    { field: 'website', label: 'Website' }
  ]
};
