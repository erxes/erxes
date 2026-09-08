export const AUTOMATION_PROPERTY_OPERATORS = {
  SET: 'set',
  CLEAR: 'clear',
  CONCAT: 'concat',
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  PERCENT: 'percent',
  ADD_DAY: 'addDay',
  SUBTRACT_DAY: 'subtractDay',
  SPLIT: 'split',
  PUSH: 'push',
  ADD_TO_SET: 'addToSet',
  PULL: 'pull',
  ALL: [
    'set',
    'clear',
    'concat',
    'add',
    'subtract',
    'multiply',
    'divide',
    'percent',
    'addDay',
    'subtractDay',
    'split',
    'push',
    'addToSet',
    'pull',
  ],
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
  SPLIT: 'split',
  FIND_OBJECT: 'findObject',
  TRANSFORM: 'transform',
  SET_PROPERTY: 'setProperty',
  SEND_EMAIL: 'sendEmail',
  OUTGOING_WEBHOOK: 'outgoingWebhook',
  MESSAGE_PRO: 'messagePro',
  WAIT_EVENT: 'waitEvent',
  AI_AGENT: 'aiAgent',
  WORKFLOW: 'workflow',
};

export const AUTOMATION_CORE_TRIGGER_TYPES = {
  INCOMING_WEBHOOK: 'core:webhooks.incoming',
  SCHEDULE: 'core:schedules.recurring',
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

/**
 * Machine readable reason an action failed. Written by the automations service
 * at the single execution error chokepoint and grouped by execution stats, so
 * "what kind of failure" is answerable without parsing error messages.
 */
// Core actions own their own pause semantics, so deferring them would fight
// the engine rather than help it.
export const AUTOMATION_NON_DEFERRABLE_CORE_ACTIONS = [
  AUTOMATION_CORE_ACTIONS.WORKFLOW,
  AUTOMATION_CORE_ACTIONS.DELAY,
  AUTOMATION_CORE_ACTIONS.IF,
  AUTOMATION_CORE_ACTIONS.SPLIT,
  AUTOMATION_CORE_ACTIONS.WAIT_EVENT,
];

/**
 * Core actions have no plugin to queue work on their behalf, so the engine
 * reads their deferral straight from here. Empty means nothing is deferred;
 * add an entry to move a core action off the synchronous path.
 */
export const AUTOMATION_CORE_ACTION_DEFERRED: Record<
  string,
  { mode: 'standby' | 'ignore'; timeoutMinutes?: number }
> = {
  // A provider call can outlast any sane synchronous budget, so the flow parks
  // on it rather than holding the trigger open.
  [AUTOMATION_CORE_ACTIONS.AI_AGENT]: { mode: 'standby', timeoutMinutes: 3 },
};

export const AUTOMATION_DEFERRED_TIMEOUT = {
  DEFAULT_MINUTES: 10,
  MAX_MINUTES: 60,
};

export const AUTOMATION_ERROR_CODES = {
  // Set explicitly where the failure is thrown
  CONFIG_INVALID: 'CONFIG_INVALID',
  NOT_FOUND: 'NOT_FOUND',
  PLUGIN_NOT_ENABLED: 'PLUGIN_NOT_ENABLED',
  PLUGIN_ACTION_FAILED: 'PLUGIN_ACTION_FAILED',
  AI_AGENT_FAILED: 'AI_AGENT_FAILED',
  WORKFLOW_DEPTH_EXCEEDED: 'WORKFLOW_DEPTH_EXCEEDED',
  DEFERRED_TIMEOUT: 'DEFERRED_TIMEOUT',
  // Derived from the outgoing webhook failure phase
  WEBHOOK_TIMEOUT: 'WEBHOOK_TIMEOUT',
  WEBHOOK_NETWORK_FAILED: 'WEBHOOK_NETWORK_FAILED',
  WEBHOOK_BAD_RESPONSE: 'WEBHOOK_BAD_RESPONSE',
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  // Fallbacks, from the shared error classifier
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type TAutomationErrorCode =
  (typeof AUTOMATION_ERROR_CODES)[keyof typeof AUTOMATION_ERROR_CODES];
