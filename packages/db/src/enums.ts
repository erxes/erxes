/**
 * The value lists core's tables store and its API accepts, one `as const` array each. The
 * tables (`text({ enum })`) and the contract (`z.enum`) both read them from here. This
 * file imports nothing, so a browser can load an enum without the tables or drizzle.
 */

// ─── Records ────────────────────────────────────────────────────────────────

/** Records that tags and custom fields attach to. */
export const CONTENT_TYPES = ['customer', 'company'] as const;

/** Records custom fields attach to: contacts, and the shared product catalog. */
export const FIELD_CONTENT_TYPES = [...CONTENT_TYPES, 'product'] as const;

export const CUSTOMER_STATES = ['lead', 'customer'] as const;

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

/** How a customer signs in: a code sent to an email address or a phone. */
export const CUSTOMER_LOGIN_KINDS = ['email', 'phone'] as const;

/** What a sign-in code is for: signing in (or up), or adding a login to a signed-in customer. */
export const CUSTOMER_CODE_PURPOSES = ['sign_in', 'add_login'] as const;

export const ORGANIZATION_STATUSES = ['active', 'suspended', 'inactive'] as const;
export const PLUGIN_TIERS = ['free', 'plus', 'pro'] as const;
export const PLUGIN_STATUSES = ['active', 'disabled'] as const;

/**
 * Who did something: a team member, a plugin (by name, e.g. `hr`) or core
 * itself (`system`: cleanups, imports). Ids only: names are resolved when shown.
 */
export const ACTOR_TYPES = ['user', 'plugin', 'system'] as const;

// ─── Platform ───────────────────────────────────────────────────────────────

/** `deleting`: removed, waiting for storage to confirm the bytes are gone (retried until it does). */
export const FILE_STATUSES = ['pending', 'ready', 'deleting'] as const;

export const NOTIFICATION_PRIORITIES = ['normal', 'high'] as const;

export const AUDIT_STREAM_FORMATS = ['erxes', 'datadog', 'splunk'] as const;
export const AUDIT_STREAM_STATUSES = ['active', 'paused'] as const;

export const EVENT_FAILURE_STATUSES = ['retrying', 'dead'] as const;

export const JOB_STATUSES = ['queued', 'running', 'dead'] as const;

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

// ─── Automations ────────────────────────────────────────────────────────────

export const AUTOMATION_STATUSES = ['draft', 'active', 'paused'] as const;
export const RUN_STATUSES = ['running', 'waiting', 'succeeded', 'failed', 'cancelled'] as const;
export const RUN_STEP_STATUSES = ['succeeded', 'failed', 'skipped'] as const;

// ─── Payments ───────────────────────────────────────────────────────────────

export const PAYMENT_GATEWAY_KINDS = ['qpay', 'test'] as const;

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
