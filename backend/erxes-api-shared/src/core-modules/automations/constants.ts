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
  INCOMING_WEBHOOK: 'core:incoming_webhook',
  USER: 'core:user',
  CUSTOMER: 'core:customer',
  LEAD: 'core:lead',
  COMPANY: 'core:company',
  FORM_SUBMISSION: 'core:form_submission',
};

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

export const AUTOMATION_ACTIONS = [
  {
    type: AUTOMATION_CORE_ACTIONS.OUTGOING_WEBHOOK,
    icon: 'IconWebhook',
    label: 'Outgoing webhook',
    description: 'Outgoing webhook',
  },
  {
    type: AUTOMATION_CORE_ACTIONS.IF,
    icon: 'IconSitemap',
    label: 'Branches',
    description: 'Create simple or if/then branches',
    folks: [
      { key: 'yes', label: 'Yes', type: 'success' },
      { key: 'no', label: 'No', type: 'error' },
    ],
  },
  {
    type: AUTOMATION_CORE_ACTIONS.FIND_OBJECT,
    icon: 'IconSearch',
    label: 'Find object',
    description: 'Find object',
    folks: [
      { key: 'isExists', label: 'Has', type: 'success' },
      { key: 'notExists', label: 'None', type: 'error' },
    ],
  },
  {
    type: AUTOMATION_CORE_ACTIONS.SET_PROPERTY,
    icon: 'IconFlask',
    label: 'Manage properties',
    description:
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations',
  },
  {
    type: AUTOMATION_CORE_ACTIONS.DELAY,
    icon: 'IconHourglass',
    label: 'Delay',
    description:
      'Delay the next action with a timeframe, a specific event or activity',
  },
  {
    type: AUTOMATION_CORE_ACTIONS.SEND_EMAIL,
    icon: 'IconMailFast',
    label: 'Send Email',
    description: 'Send Email',
    emailRecipientsConst: AUTOMATION_EMAIL_RECIPIENTS_TYPES,
  },
  {
    type: AUTOMATION_CORE_ACTIONS.WAIT_EVENT,
    icon: 'IconClockPlay',
    label: 'Wait event',
    description: 'Delay until event is triggered',
  },

  // TODO: Uncomment this when we have a way to embed files

  // {
  //   type: AUTOMATION_CORE_ACTIONS.AI_AGENT,
  //   icon: 'IconAi',
  //   label: 'Ai Agent',
  //   description:
  //     'Handle workflow conversations by topic using AI agents with embedded knowledge',
  // },
];

export const AUTOMATION_TRIGGERS = [
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.INCOMING_WEBHOOK,
    icon: 'IconWebhook',
    label: 'Incoming Webhook',
    description:
      'Trigger automation workflows when external systems send HTTP requests to your webhook endpoint',
    isCustom: true,
  },
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.USER,
    icon: 'IconUsers',
    label: 'Team member',
    description:
      'Start with a blank workflow that enrolls and is triggered off team members',
  },
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.CUSTOMER,
    icon: 'IconUsersGroup',
    label: 'Customer',
    description:
      'Start with a blank workflow that enrolls and is triggered off Customers',
  },
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.LEAD,
    icon: 'IconUsersGroup',
    label: 'Lead',
    description:
      'Start with a blank workflow that enrolls and is triggered off Leads',
  },
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.COMPANY,
    icon: 'IconBuilding',
    label: 'Company',
    description:
      'Start with a blank workflow that enrolls and is triggered off company',
  },
  {
    type: AUTOMATION_CORE_TRIGGER_TYPES.FORM_SUBMISSION,
    icon: 'IconForms',
    label: 'Form submission',
    description:
      'Start with a blank workflow that enrolls and is triggered off form submission',
  },
];

export const AUTOMATION_CORE_PROPERTY_TYPES = [
  {
    value: 'core:customer',
    label: 'Customer',
    fields: [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
    ],
  },
  {
    value: 'core:company',
    label: 'Company',
    fields: [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
    ],
  },
  {
    value: 'core:product',
    label: 'Product',
    fields: [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
      { label: 'Code', value: 'code' },
    ],
  },
  {
    value: 'core:tag',
    label: 'Tag',
    fields: [
      { label: 'ID', value: '_id' },
      { label: 'Name', value: 'name' },
    ],
  },
];
