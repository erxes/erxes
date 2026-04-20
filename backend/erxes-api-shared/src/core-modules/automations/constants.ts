export const AUTOMATION_PROPERTY_OPERATORS = {
  SET: 'set',
  CONCAT: 'concat',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  PERCENT: 'percent',
  ALL: ['set', 'concat', 'add', 'subtract', 'multiply', 'divide', 'percent'],
};

export const STATIC_PLACEHOLDER = {
  '{{ now }}': 0,
  '{{ tomorrow }}': 1,
  '{{ nextWeek }}': 7,
  '{{ nextMonth }}': 30,
};

export const AUTOMATION_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const AUTOMATION_CORE_ACTIONS = {
  DELAY: 'delay',
  IF: 'if',
  FIND_OBJECT: 'findObject',
  SET_PROPERTY: 'setProperty',
  SEND_EMAIL: 'sendEmail',
  OUTGOING_WEBHOOK: 'outgoingWebhook',
  WAIT_EVENT: 'waitEvent',
  AI_AGENT: 'aiAgent',
};

export const AUTOMATION_CORE_TRIGGER_TYPES = {
  INCOMING_WEBHOOK: 'core:webhooks.incoming',
  USER: 'core:organization.users',
  CUSTOMER: 'core:contacts.customers',
  LEAD: 'core:contacts.leads',
  COMPANY: 'core:contacts.companies',
};

export enum TAutomationFindObjectType {
  COMPANY = 'core:contacts.companies',
  CUSTOMER = 'core:contacts.customers',
  USER = 'core:organization.users',
}

export const AUTOMATION_EMAIL_RECIPIENTS_TYPES = [
  {
    type: 'customMail',
    name: 'customMails',
    label: 'Custom Mails',
  },
  {
    type: 'attributionMail',
    name: 'attributionMails',
    label: 'Attribution Mails',
  },
  {
    type: 'segmentBased',
    name: 'segmentBased',
    label: 'Trigger Segment Based Mails',
  },
  {
    type: 'teamMember',
    name: 'teamMemberIds',
    label: 'Team Members',
  },
  {
    type: 'lead',
    name: 'leadIds',
    label: 'Leads',
  },
  {
    type: 'customer',
    name: 'customerIds',
    label: 'Customers',
  },
  {
    type: 'company',
    name: 'companyIds',
    label: 'Companies',
  },
];
