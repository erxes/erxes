export const ACTIONS = {
  WAIT: 'delay',
  IF: 'if',
  SET_PROPERTY: 'setProperty',
  SEND_EMAIL: 'sendEmail'
};

export const UI_ACTIONS = [
  {
    type: 'if',
    icon: 'sitemap-1',
    label: 'Branches',
    description: 'Create simple or if/then branches',
    isAvailable: true
  },
  {
    type: 'setProperty',
    icon: 'flask',
    label: 'Manage properties',
    description:
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations',
    isAvailable: true
  },
  {
    type: 'delay',
    icon: 'hourglass',
    label: 'Delay',
    description:
      'Delay the next action with a timeframe, a specific event or activity',
    isAvailable: true
  },
  {
    type: 'workflow',
    icon: 'glass-martini-alt',
    label: 'Workflow',
    description:
      'Enroll in another workflow,  trigger outgoing webhook or write custom code',
    isAvailable: false
  },
  {
    type: 'sendEmail',
    icon: 'fast-mail',
    label: 'Send Email',
    description: 'Send',
    isAvailable: true
  }
];

export const EMAIL_RECIEPENTS_TYPES = [
  {
    type: 'teamMember',
    name: 'teamMemberIds',
    label: 'Team Members'
  },
  {
    type: 'customMail',
    name: 'customMails',
    label: 'Custom Mails'
  },
  {
    type: 'triggerAttributionMails',
    name: 'triggerAttributionMails',
    label: 'Trigger Attribution Mails'
  },
  {
    type: 'segmentBased',
    name: 'segmentBased',
    label: 'Trigger Segment Based Mails'
  }
];
