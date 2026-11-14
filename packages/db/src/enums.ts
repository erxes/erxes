/**
 * Every value list core stores, accepts or reads from its settings, one `as const` array
 * each. The tables (`text({ enum })`, `inList` checks), the contract (`z.enum`) and the
 * config all read them from here; `erxes/no-inline-enum` fails a list spelled out anywhere
 * else. This file imports nothing, so a browser can load an enum without the tables or drizzle.
 */

// ─── Records ────────────────────────────────────────────────────────────────

/** The contact records: what tags, trash, webhooks and automation subjects refer to. */
export const CONTENT_TYPES = ['customer', 'company'] as const;

/** An automation or plugin action's subject: a contact record, or either. */
export const AUTOMATION_SUBJECTS = [...CONTENT_TYPES, 'any'] as const;

/** Records custom fields attach to: contacts, and the shared product catalog. */
export const FIELD_CONTENT_TYPES = [...CONTENT_TYPES, 'product'] as const;

export const CUSTOMER_STATES = ['lead', 'customer'] as const;

/** ISO/IEC 5218: not known, male, female, not applicable. */
export const CUSTOMER_SEXES = [0, 1, 2, 9] as const;

/** The fields no two customers share. A 409 `CUSTOMER_EXISTS` names the one that was taken. */
export const CUSTOMER_UNIQUE_FIELDS = ['primaryEmail', 'primaryPhone'] as const;

/** `open`: still being worked; `qualified`: ready to become a customer; `disqualified`: not a fit (lost). */
export const LEAD_STAGE_KINDS = ['open', 'qualified', 'disqualified'] as const;

export const LEAD_EVENTS = ['created', 'stage', 'converted', 'reopened'] as const;

export const PRODUCT_KINDS = ['goods', 'service'] as const;
export const PRODUCT_STATUSES = ['active', 'archived'] as const;

/** Lists views belong to: customers, leads (people), companies, company leads, products. */
export const VIEW_RECORD_TYPES = [
  'customer',
  'lead',
  'company',
  'company_lead',
  'product',
] as const;

export const ACTIVITY_TARGETS = ['customer', 'company'] as const;

/** Which activities a record's timeline shows. */
export const TIMELINE_KINDS = ['all', 'notes', 'changes', 'plugins'] as const;

// ─── Lists, filters and paging ──────────────────────────────────────────────

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export const PAGE_DIRECTIONS = ['forward', 'backward'] as const;

/** Whether a page starts at the cursor's record or after it. */
export const CURSOR_MODES = ['inclusive', 'exclusive'] as const;

/** A yes/no query parameter or setting, as text. */
export const BOOLEAN_STRINGS = ['true', 'false'] as const;

/** How a list filter's values compare. */
export const FILTER_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'member',
  'tags',
] as const;

/** Where a list filter comes from, for grouping in the picker. */
export const FILTER_FIELD_GROUPS = ['fields', 'lead', 'custom', 'company', 'activity'] as const;

// ─── Custom fields and conditions ───────────────────────────────────────────

export const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'date',
  'boolean',
  'select',
  'multiselect',
  'radio',
  'check',
  'phone',
  'list',
] as const;

/** `all`: every condition holds; `any`: one does. */
export const CONDITION_MATCHES = ['all', 'any'] as const;

/** The units of a relative date condition's `{ amount, unit }`. */
export const RELATIVE_DATE_UNITS = ['days', 'weeks', 'months'] as const;

/** Formats a text field's values must have. */
export const FIELD_VALIDATIONS = ['number', 'email', 'date'] as const;

export const CONDITION_OPERATORS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'contains',
  'not_contains',
  'starts_with',
  'in',
  'not_in',
  'exists',
  'not_exists',
  /** Dates relative to now; the value is `{ amount, unit }` (days, weeks, months). */
  'within_last',
  'more_than_ago',
  'within_next',
  /** The day and month fall within the next `amount` days (birthdays, anniversaries), whatever the year. */
  'anniversary_within',
] as const;

// ─── People and organisations ───────────────────────────────────────────────

export const USER_STATUSES = ['invited', 'active', 'disabled'] as const;

/** The built-in roles every organisation has. */
export const USER_ROLES = ['owner', 'admin', 'member'] as const;

export const AUTH_TOKEN_PURPOSES = ['invite', 'password_reset'] as const;

/** The languages core's emails and example data come in. */
export const LANGUAGES = ['en', 'mn'] as const;

/** How a member gets one kind of notification. */
export const NOTIFICATION_DELIVERIES = ['email', 'inbox', 'off'] as const;

/** How a customer signs in: a code sent to an email address or a phone. */
export const CUSTOMER_LOGIN_KINDS = ['email', 'phone'] as const;

/** What a sign-in code is for: signing in (or up), or adding a login to a signed-in customer. */
export const CUSTOMER_CODE_PURPOSES = ['sign_in', 'add_login'] as const;

export const ORGANIZATION_STATUSES = ['active', 'suspended', 'inactive'] as const;
export const PLUGIN_TIERS = ['free', 'plus', 'pro'] as const;
export const PLUGIN_STATUSES = ['active', 'disabled'] as const;

/** A plugin's billing status on erxes.io: `past_due` while Stripe retries, `canceling` until the period ends. */
export const ENTITLEMENT_STATUSES = ['active', 'past_due', 'canceling'] as const;

/**
 * What a plugin may do here: `full`; `warning` (payment retrying or ending
 * at period end: everything still works); `read_only` (it left the plan:
 * reads and exports for the grace period); `off` (not in the plan).
 */
export const PLUGIN_ACCESS = ['full', 'warning', 'read_only', 'off'] as const;

/**
 * Who did something: a team member, a plugin (by name, e.g. `hr`) or core
 * itself (`system`: cleanups, imports). Ids only: names are resolved when shown.
 */
export const ACTOR_TYPES = ['user', 'plugin', 'system'] as const;

// ─── Platform ───────────────────────────────────────────────────────────────

/** `deleting`: removed, waiting for storage to confirm the bytes are gone (retried until it does). */
export const FILE_STATUSES = ['pending', 'ready', 'deleting'] as const;

/** Where files are kept. */
export const FILE_STORAGES = ['local', 's3'] as const;

/** What a signed local-storage link allows. */
export const FILE_GRANT_OPS = ['put', 'get'] as const;

/** How a browser gets live updates: a stream, or polling when streams are off. */
export const LIVE_MODES = ['live', 'polling'] as const;

export const NOTIFICATION_PRIORITIES = ['normal', 'high'] as const;

export const AUDIT_STREAM_FORMATS = ['erxes', 'datadog', 'splunk'] as const;
export const AUDIT_STREAM_STATUSES = ['active', 'paused'] as const;

/** Where a new audit stream starts: new entries only, or the whole log. */
export const AUDIT_STREAM_STARTS = ['now', 'beginning'] as const;

export const AUDIT_EXPORT_FORMATS = ['csv', 'json'] as const;

export const EVENT_FAILURE_STATUSES = ['retrying', 'dead'] as const;

export const WEBHOOK_STATUSES = ['active', 'disabled'] as const;
export const WEBHOOK_DELIVERY_STATUSES = ['pending', 'succeeded', 'failed'] as const;

export const TRANSFER_RECORD_TYPES = ['customer', 'lead', 'company'] as const;

export const IMPORT_STATUSES = [
  'parsing',
  'mapping',
  'checking',
  'checked',
  'running',
  'done',
  'failed',
  'undone',
] as const;

export const EXPORT_STATUSES = ['running', 'done', 'failed'] as const;
export const EXPORT_FORMATS = ['csv', 'xlsx'] as const;

/** The columns an import maps to: the record's fields, custom fields, links to other records. */
export const TRANSFER_FIELD_GROUPS = ['fields', 'custom', 'relations'] as const;

export const IMPORT_MODES = ['create', 'update', 'upsert'] as const;

/** The column an import finds an existing record by. */
export const IMPORT_MATCH_KEYS = ['email', 'phone', 'code', 'id', 'name'] as const;

/** What an import does with one row. */
export const IMPORT_ROW_ACTIONS = ['create', 'update', 'skip', 'error'] as const;

// ─── Automations ────────────────────────────────────────────────────────────

export const AUTOMATION_STATUSES = ['draft', 'active', 'paused'] as const;
export const FINISHED_RUN_STATUSES = ['succeeded', 'failed', 'cancelled'] as const;
export const RUN_STATUSES = ['running', 'waiting', ...FINISHED_RUN_STATUSES] as const;
export const RUN_STEP_STATUSES = ['succeeded', 'failed', 'skipped'] as const;

/** Whether a record may enter an automation again: every time, once, or once a day. */
export const REENTRY_RULES = ['always', 'once', 'daily'] as const;

export const DELAY_UNITS = ['minutes', 'hours', 'days'] as const;

/** How often a scheduled trigger fires. */
export const SCHEDULE_INTERVALS = ['hour', 'day', 'week', 'month'] as const;

/** How the values of a path conditions and placeholders read compare. */
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
  'custom_field',
  'lead_stage',
  'recipients',
] as const;

// ─── Payments ───────────────────────────────────────────────────────────────

export const PAYMENT_GATEWAY_KINDS = ['qpay', 'test'] as const;
export const PAYMENT_GATEWAY_STATUSES = ['active', 'disabled'] as const;

/** How a gateway refunds: any part, only the whole payment, or not at all. */
export const GATEWAY_REFUND_KINDS = ['partial', 'full', 'none'] as const;

export const INVOICE_STATUSES = [
  'pending',
  'paid',
  'refunded',
  'cancelled',
  'expired',
  'failed',
] as const;

export const REFUND_STATUSES = ['succeeded', 'failed'] as const;
export const REFUND_METHODS = ['gateway', 'manual'] as const;

// ─── Settings ───────────────────────────────────────────────────────────────

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export const LOG_FORMATS = ['json', 'pretty'] as const;
export const EMAIL_DRIVERS = ['smtp', 'log'] as const;
export const SMS_DRIVERS = ['log'] as const;
