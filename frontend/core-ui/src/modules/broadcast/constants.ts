import { BadgeProps } from 'erxes-ui';

export const BROADCAST_MESSAGE_KINDS: Record<string, string> = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
};

export const BROADCAST_MESSAGE_METHOD_KINDS: Record<string, string> = {
  email: 'manual',
  messenger: 'visitorAuto',
  notification: 'manual',
};

export const BROADCAST_METHODS: Record<string, string> = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  SMS: 'sms',
  NOTIFICATION: 'notification',
};

export const BROADCAST_KIND_FILTERS: Record<string, string> = {
  auto: 'Auto',
  visitorAuto: 'Visitor auto',
  manual: 'Manual',
};

export const BROADCAST_MESSENGER_MESSAGE_TYPES: Record<string, string> = {
  chat: 'Chat',
  note: 'Note',
  post: 'Post',
};

export const BROADCAST_MESSENGER_SENT_AS_TYPES: Record<string, string> = {
  badge: 'Badge',
  snippet: 'Snippet',
  fullMessage: 'Show the full message',
};

export const BROADCAST_RULE_STRING_TYPE = {
  is: 'Is',
  isNot: 'Is not',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  contains: 'Contains',
  doesNotContain: 'Does not contain',
  isUnknown: 'Is unknown',
  hasAnyValue: 'Has any value',
};

export const BROADCAST_RULE_NUMBER_TYPE = {
  greaterThan: 'Greater than',
  lessThan: 'Less than',
  is: 'Is',
  isNot: 'Is not',
  isUnknown: 'Is unknown',
  hasAnyValue: 'Has any value',
};

export const BROADCAST_RULE_CONDITIONS: Record<
  string,
  Record<string, string>
> = {
  browserLanguage: BROADCAST_RULE_STRING_TYPE,
  currentPageUrl: BROADCAST_RULE_STRING_TYPE,
  country: BROADCAST_RULE_STRING_TYPE,
  city: BROADCAST_RULE_STRING_TYPE,
  numberOfVisits: BROADCAST_RULE_NUMBER_TYPE,
};

export const BROADCAST_RULES: Record<
  string,
  { title: string; description: string; placeholder: string }
> = {
  browserLanguage: {
    title: 'Browser language',
    description:
      'Recognizes which language is set for visitor’s browser. Insert only Language codes in value field as appointed in ISO-639, i.e "en" for English, "fr" for French, "de" for German etc.',
    placeholder: 'en',
  },
  currentPageUrl: {
    title: 'Current page url',
    description:
      'Write your desired page URL, excluding domain name. For example: If you want to place your engagement message on https://office.erxes.io/pricing - then write /pricing',
    placeholder: '/pricing',
  },
  country: {
    title: 'Country',
    description:
      'Locates visitor’s physical location in country resolution. Insert only Country codes in value field as appointed in ISO-3166 standard, i.e “gb” for Great Britain, “fr” for French, “de” for German, “jp” for Japanese etc.',
    placeholder: 'gb',
  },
  city: {
    title: 'City',
    description:
      'Locates visitor’s physical location in city resolution. Write a name of the City in value field. If Country’s not set, every city with same name will meet the criteria.',
    placeholder: 'London',
  },
  numberOfVisits: {
    title: 'Number of visits',
    description: 'Counts individual visitor’s visiting number.',
    placeholder: '3',
  },
};

export const BROADCAST_TARGET_TYPE: Record<string, string> = {
  segment: 'Segment',
  tag: 'Tag',
  brand: 'Brand',
};

export const BROADCAST_MESSAGE_STATUS = [
  { value: 'sent', label: 'Sent' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'sending', label: 'Sending' },
  { value: 'notSent', label: 'Not Sent' },
];

export const BROADCAST_MESSAGE_STATUS_MAP: Record<
  string,
  { text: string; style: BadgeProps['variant'] }
> = {
  sending: { text: 'Sending', style: 'info' },
  completed: { text: 'Sent', style: 'success' },
  failed: { text: 'Not Sent', style: 'warning' },
};

export const BROADCAST_MESSAGE_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'notification', label: 'Notification' },
];

export const BROADCAST_MESSAGE_KIND = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

export const BROADCAST_SETTINGS_CONFIG_FIELDS = [
  {
    name: 'BROADCAST_AWS_SES_ACCESS_KEY_ID',
    inputType: 'input',
    type: 'text',
    label: 'AWS SES Access Key id',
    description: '',
  },
  {
    name: 'BROADCAST_AWS_SES_SECRET_ACCESS_KEY',
    inputType: 'input',
    type: 'text',
    label: 'AWS SES Secret Access Key',
    description: '',
  },
  {
    name: 'BROADCAST_AWS_REGION',
    inputType: 'input',
    type: 'text',
    label: 'AWS Region',
    description: '',
  },
  {
    name: 'BROADCAST_AWS_SES_CONFIG_SET',
    inputType: 'input',
    type: 'text',
    label: 'AWS SES Config Set',
    description: '',
  },
  {
    name: 'BROADCAST_UNVERIFIED_EMAILS_LIMIT',
    inputType: 'input',
    type: 'number',
    label: 'Unverified emails limit',
    description: '',
  },
  {
    name: 'BROADCAST_ALLOWED_EMAIL_SKIP_LIMIT',
    inputType: 'input',
    type: 'number',
    label: 'Allowed email skip limit',
    description:
      'The number of times that each customer can skip to open or click campaign emails. If this limit is exceeded, then the customer will automatically set to unsubscribed mode.',
  },
  {
    name: 'BROADCAST_CUSTOMER_LIMIT_PER_AUTO_SMS_CAMPAIGN',
    inputType: 'input',
    type: 'number',
    label: 'Customer limit per auto SMS campaign',
    description:
      'The maximum number of customers that can receive auto SMS campaign per each runtime.',
  },
];
