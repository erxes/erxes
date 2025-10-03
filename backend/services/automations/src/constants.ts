export const ACTIONS = {
  WAIT: 'delay',
  IF: 'if',
  SET_PROPERTY: 'setProperty',
  SEND_EMAIL: 'sendEmail',
};

export const EMAIL_RECIPIENTS_TYPES = [
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

export const UI_ACTIONS = [
  {
    type: 'if',
    icon: 'Sitemap',
    label: 'Branches',
    description: 'Create simple or if/then branches',
    isAvailable: true,
  },
  {
    type: 'setProperty',
    icon: 'Flask',
    label: 'Manage properties',
    description:
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations',
    isAvailable: true,
  },
  {
    type: 'delay',
    icon: 'Hourglass',
    label: 'Delay',
    description:
      'Delay the next action with a timeframe, a specific event or activity',
    isAvailable: true,
  },
  {
    type: 'workflow',
    icon: 'JumpRope',
    label: 'Workflow',
    description:
      'Enroll in another workflow,  trigger outgoing webhook or write custom code',
    isAvailable: false,
  },
  {
    type: 'sendEmail',
    icon: 'MailFast',
    label: 'Send Email',
    description: 'Send Email',
    emailRecipientsConst: EMAIL_RECIPIENTS_TYPES,
    isAvailable: true,
  },
];
