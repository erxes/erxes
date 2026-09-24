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
  segment: 'target-type.segment',
  tag: 'target-type.tag',
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
    titleKey: 'stat.notification.total',
    descriptionKey: 'stat.notification.total-body',
    icon: IconUsers,
  },
  sent: {
    titleKey: 'stat.notification.sent',
    descriptionKey: 'stat.notification.sent-body',
    icon: IconUserCheck,
  },
  read: {
    titleKey: 'stat.notification.read',
    descriptionKey: 'stat.notification.read-body',
    icon: IconBellRinging,
  },
  push: {
    titleKey: 'stat.notification.push',
    descriptionKey: 'stat.notification.push-body',
    icon: IconDeviceMobile,
  },
};

export const BROADCAST_WORKFLOW_STATISTIC = {
  total: {
    titleKey: 'stat.workflow.total',
    descriptionKey: 'stat.workflow.total-body',
    icon: IconUsers,
  },
  started: {
    titleKey: 'stat.workflow.started',
    descriptionKey: 'stat.workflow.started-body',
    icon: IconRouteSquare,
  },
};

export const BROADCAST_PROVIDER_FIELDS: Record<
  string,
  Array<{ name: string; labelKey: string; type?: string }>
> = {
  SES: [
    {
      name: 'BROADCAST_AWS_SES_ACCESS_KEY_ID',
      labelKey: 'settings.ses-access-key',
    },
    {
      name: 'BROADCAST_AWS_SES_SECRET_ACCESS_KEY',
      labelKey: 'settings.ses-secret-key',
    },
    { name: 'BROADCAST_AWS_REGION', labelKey: 'settings.aws-region' },
    {
      name: 'BROADCAST_AWS_SES_CONFIG_SET',
      labelKey: 'settings.ses-config-set',
    },
  ],
  sendgrid: [
    {
      name: 'BROADCAST_SENDGRID_API_KEY',
      labelKey: 'settings.sendgrid-api-key',
      type: 'password',
    },
    {
      name: 'BROADCAST_SENDGRID_SUBUSER',
      labelKey: 'settings.sendgrid-subuser',
    },
  ],
  custom: [
    { name: 'BROADCAST_MAIL_SERVICE', labelKey: 'settings.mail-service' },
    { name: 'BROADCAST_MAIL_HOST', labelKey: 'settings.mail-host' },
    { name: 'BROADCAST_MAIL_PORT', labelKey: 'settings.mail-port' },
    { name: 'BROADCAST_MAIL_USER', labelKey: 'settings.mail-user' },
    {
      name: 'BROADCAST_MAIL_PASS',
      labelKey: 'settings.mail-password',
      type: 'password',
    },
  ],
};

export const BROADCAST_SETTINGS_CONFIG_FIELDS = [
  {
    name: 'BROADCAST_UNVERIFIED_EMAILS_LIMIT',
    type: 'number',
    labelKey: 'settings.unverified-limit',
  },
  {
    name: 'BROADCAST_ALLOWED_EMAIL_SKIP_LIMIT',
    type: 'number',
    labelKey: 'settings.skip-limit',
  },
  {
    name: 'BROADCAST_CUSTOMER_LIMIT_PER_AUTO_SMS_CAMPAIGN',
    type: 'number',
    labelKey: 'settings.sms-limit',
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
  pause: 'confirm.pause',
  resume: 'confirm.resume',
  sendNow: 'confirm.send-now',
  goLive: 'confirm.go-live',
  cancelSchedule: 'confirm.cancel-schedule',
} as const;
