/** What the approval module locks when a campaign is locked. */
export const BROADCAST_APPROVAL_CONTENT_TYPE = 'core:broadcast_campaign';

import { BadgeProps } from 'erxes-ui';
import {
  IconBellRinging,
  IconDeviceMobile,
  IconRouteSquare,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';

export const BROADCAST_MESSAGE_KINDS: Record<string, string> = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
};

export const BROADCAST_MESSAGE_METHOD_KINDS: Record<string, string> = {
  email: 'manual',
  messenger: 'visitorAuto',
  notification: 'manual',
  workflow: 'manual',
};

export const BROADCAST_METHODS: Record<string, string> = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  SMS: 'sms',
  NOTIFICATION: 'notification',
  WORKFLOW: 'workflow',
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
};

export const BROADCAST_MESSAGE_STATUS = [
  { value: 'sent', labelKey: 'status.sent' },
  { value: 'draft', labelKey: 'status.draft' },
  { value: 'paused', labelKey: 'status.paused' },
  { value: 'sending', labelKey: 'status.sending' },
  { value: 'notSent', labelKey: 'status.not-sent' },
];

export const BROADCAST_MESSAGE_STATUS_MAP: Record<
  string,
  { labelKey: string; style: BadgeProps['variant'] }
> = {
  sending: { labelKey: 'status.sending', style: 'info' },
  completed: { labelKey: 'status.sent', style: 'success' },
  failed: { labelKey: 'status.not-sent', style: 'warning' },
};

/** Every method a campaign can carry, including ones no longer offered. */
export const BROADCAST_MESSAGE_METHODS = [
  {
    value: 'email',
    labelKey: 'method.email',
    descriptionKey: 'method.email-description',
  },
  {
    value: 'messenger',
    labelKey: 'method.messenger',
    descriptionKey: 'method.messenger-description',
  },
  {
    value: 'notification',
    labelKey: 'method.notification',
    descriptionKey: 'method.notification-description',
  },
  {
    value: 'workflow',
    labelKey: 'method.workflow',
    descriptionKey: 'method.workflow-description',
  },
];

/**
 * What a campaign may be created as.
 *
 * Messenger is absent: nothing sends it — `sendBroadcast` has no branch for it
 * and its worker is empty — so offering it would build a campaign that goes
 * live and quietly does nothing. It stays above so a campaign already carrying
 * it still reads as Messenger rather than as a blank.
 */
export const BROADCAST_SELECTABLE_METHODS = BROADCAST_MESSAGE_METHODS.filter(
  ({ value }) => value !== 'messenger',
);

export const BROADCAST_NOTIFICATION_STATISTIC = {
  total: {
    title: 'Targeted',
    description:
      'Customers matched by the selected tag who are eligible for this campaign.',
    icon: IconUsers,
  },
  sent: {
    title: 'Sent',
    description:
      'Client portal users who successfully received the notification.',
    icon: IconUserCheck,
  },
  read: {
    title: 'Read',
    description:
      'Recipients who opened and marked the in-app notification as read.',
    icon: IconBellRinging,
  },
  push: {
    title: 'Push enabled',
    description:
      'Campaign was configured to deliver mobile and web push notifications.',
    icon: IconDeviceMobile,
  },
};

export const BROADCAST_WORKFLOW_STATISTIC = {
  total: {
    title: 'Targeted',
    description:
      'Customers matched by this campaign’s audience when it was last run.',
    icon: IconUsers,
  },
  started: {
    title: 'Workflow started',
    description:
      'Customers the flow was started for. A step that waits or delays can run for days afterwards, so what happened next lives in the flow’s own history.',
    icon: IconRouteSquare,
  },
};

export const BROADCAST_MESSAGE_KIND = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

export const BROADCAST_PROVIDER_FIELDS: Record<
  string,
  Array<{ name: string; label: string; type?: string }>
> = {
  SES: [
    {
      name: 'BROADCAST_AWS_SES_ACCESS_KEY_ID',
      label: 'AWS SES Access Key id',
    },
    {
      name: 'BROADCAST_AWS_SES_SECRET_ACCESS_KEY',
      label: 'AWS SES Secret Access Key',
    },
    { name: 'BROADCAST_AWS_REGION', label: 'AWS Region' },
    { name: 'BROADCAST_AWS_SES_CONFIG_SET', label: 'AWS SES Config Set' },
  ],
  sendgrid: [
    {
      name: 'BROADCAST_SENDGRID_API_KEY',
      label: 'SendGrid API Key',
      type: 'password',
    },
    { name: 'BROADCAST_SENDGRID_SUBUSER', label: 'SendGrid Subuser' },
  ],
  custom: [
    { name: 'BROADCAST_MAIL_SERVICE', label: 'Mail Service Name' },
    { name: 'BROADCAST_MAIL_HOST', label: 'Host' },
    { name: 'BROADCAST_MAIL_PORT', label: 'Port' },
    { name: 'BROADCAST_MAIL_USER', label: 'Username' },
    { name: 'BROADCAST_MAIL_PASS', label: 'Password', type: 'password' },
  ],
};

export const BROADCAST_SETTINGS_CONFIG_FIELDS = [
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

export const BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY =
  'broadcast-recipients-cursor';

/**
 * What each action promises before it is carried out.
 *
 * Kept together because the same campaign is acted on from the table, the
 * grid, the detail sheet and the command bar, and a promise that differs
 * between them is a promise one of them is breaking.
 */
export const BROADCAST_CONFIRM_MESSAGES = {
  // What it promises is exactly what it does: recipients already handed over
  // keep going, and nobody new is taken up.
  pause:
    'Pause this broadcast? Nobody new will be sent to. Anyone already sent to is unaffected, and going live again continues where it stopped.',
  resume: 'Continue this broadcast? It picks up where it stopped.',
  sendNow:
    'Send this broadcast now? It will not wait for the moment it was scheduled for.',
  goLive: 'Set this broadcast live?',
  cancelSchedule:
    'Cancel this schedule? The broadcast goes back to being a draft and will not go out on its own.',
} as const;
