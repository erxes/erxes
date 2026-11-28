/** Automation lists, kept with `./enums` (which re-exports them). */

export const AUTOMATION_STATUSES = ['draft', 'active', 'paused'] as const;
export const FINISHED_RUN_STATUSES = ['succeeded', 'failed', 'cancelled'] as const;
export const RUN_STATUSES = ['running', 'waiting', ...FINISHED_RUN_STATUSES] as const;
export const RUN_STEP_STATUSES = ['succeeded', 'failed', 'skipped'] as const;

/** Whether a record may enter an automation again: every time, once, or once a day. */
export const REENTRY_RULES = ['always', 'once', 'daily'] as const;

export const DELAY_UNITS = ['minutes', 'hours', 'days'] as const;

export const DECISION_PROVIDERS = ['typesafe', 'openai'] as const;

/** How often a scheduled trigger fires. */
export const SCHEDULE_INTERVALS = ['minute', 'hour', 'day', 'week', 'month'] as const;

export const HOOK_CUSTOMER_KEYS = ['id', 'primaryEmail', 'primaryPhone'] as const;

export const HOOK_COMPANY_KEYS = ['id', 'primaryName'] as const;

/** How the values of a path conditions and placeholders read compare. */
export const CORE_RECORD_REFERENCES = ['customer', 'company', 'product'] as const;

export const AUTOMATION_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'boolean',
  'list',
  'member',
  'tags',
  'select',
] as const;

/**
 * What core remembers of an event type's payload: `seen` marks that the type happened at all,
 * the others how a key's values compare (each is one of `AUTOMATION_FIELD_TYPES`).
 */
export const EVENT_DATA_KINDS = ['seen', 'text', 'number', 'boolean', 'list'] as const;

/** The inputs an action's form shows. */
export const ACTION_FIELD_TYPES = [
  'text',
  'longtext',
  'number',
  'boolean',
  'date',
  'select',
  'members',
  'tags',
  'json',
  'key_values',
  'data_field',
  'lead_stage',
  'recipients',
  'plugin_record',
  'reply_to',
  'from_address',
  /** One of the organisation's Mail service connections that are on; empty: Organization email. */
  'mail_connection',
  'automation',
  'connection',
] as const;
