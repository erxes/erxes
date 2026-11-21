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

/** Records custom fields and tags attach to: contacts, and the shared product catalog. */
export const FIELD_CONTENT_TYPES = [...CONTENT_TYPES, 'product'] as const;

/**
 * A plugin's own record type custom fields are defined for, `<plugin>.<type>`
 * (`operation.task`). Core keeps the definitions; the plugin keeps the values.
 */
export const PLUGIN_RECORD_TYPE = String.raw`^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$`;

export const CUSTOMER_STATES = ['lead', 'customer'] as const;

/** ISO/IEC 5218: not known, male, female, not applicable. */
export const CUSTOMER_SEXES = [0, 1, 2, 9] as const;

/** `open`: still being worked; `qualified`: ready to become a customer; `disqualified`: not a fit (lost). */
export const LEAD_STAGE_KINDS = ['open', 'qualified', 'disqualified'] as const;

export const LEAD_EVENTS = ['created', 'stage', 'converted', 'reopened'] as const;

/**
 * The organisation's structure: where a member works (branch) and what they do (department).
 * Two independent trees in one table; a unit's parent is always of its own kind.
 */
export const ORG_UNIT_KINDS = ['branch', 'department'] as const;

export const PRODUCT_KINDS = ['goods', 'service'] as const;
export const PRODUCT_STATUSES = ['active', 'archived'] as const;

/** What global search finds in core: people (customers and leads), companies, products, team members, branches and departments. */
export const SEARCH_RECORD_TYPES = ['customer', 'company', 'product', 'member', 'unit'] as const;

/** Lists views belong to: customers, leads (people), companies, company leads, products. */
export const VIEW_RECORD_TYPES = [
  'customer',
  'lead',
  'company',
  'company_lead',
  'product',
] as const;

/**
 * A plugin's list, `<plugin>:<record>` (`sales:deal`): views belong to it, imports and exports
 * carry its records. Core only stores these; the plugin's own API answers for them.
 */
export const PLUGIN_LIST_TYPE = '^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$';

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
  'customer',
  'company',
  'product',
] as const;

/** Where a list filter comes from, for grouping in the picker; `plugin`: a plugin's fields, under its name. */
export const FILTER_FIELD_GROUPS = [
  'fields',
  'lead',
  'custom',
  'company',
  'activity',
  'plugin',
] as const;

/** What automations' conditions read: a list filter's fields, and the event's. */
export const AUTOMATION_FIELD_GROUPS = [...FILTER_FIELD_GROUPS, 'event'] as const;

/** How an automation path's values compare: a list filter's types, and `list` (several values) of event data and step outputs. */
export const AUTOMATION_PATH_TYPES = [...FILTER_FIELD_TYPES, 'list'] as const;

/** How a field of a plugin's relation (`relations` in its manifest) compares: its view column's kind. */
export const RELATION_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'member',
  'product',
] as const;

/**
 * What a relation rule measures over the related rows: how many, or a number field's total,
 * average, least or most (a date field's earliest or latest).
 */
export const RELATION_MEASURES = ['count', 'sum', 'avg', 'min', 'max'] as const;

/** What a relation's `view` may be (`pg_class.relkind`): a view, a materialized view or a table. */
export const RELATION_VIEW_KINDS = ['v', 'm', 'r', 'p'] as const;

// ─── Custom fields and conditions ───────────────────────────────────────────

/** Types of the fields a plugin declares in its manifest (it writes their values). */
export const PLUGIN_FIELD_TYPES = ['number', 'date', 'text', 'select', 'multiselect'] as const;

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

/** How a field's `logic` rule compares another field's value. */
export const FIELD_LOGIC_OPERATORS = [
  'is',
  'isNot',
  'contains',
  'greaterThan',
  'lessThan',
  'hasValue',
  'isEmpty',
] as const;

/** What a field's `logic` does when its rules match: show the field, or hide it. */
export const FIELD_LOGIC_ACTIONS = ['show', 'hide'] as const;

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

/** Built-in roles a plugin's permission set can be given to by default; Owner and Admin have everything. */
export const DEFAULT_GRANT_ROLES = ['member'] as const;

export type DefaultGrantRole = (typeof DEFAULT_GRANT_ROLES)[number];

export const AUTH_TOKEN_PURPOSES = ['invite', 'password_reset'] as const;

/**
 * What an API key is: `member` acts as its maker with their role now (keys made before
 * rules); `regular` works with data, `management` with organisation setup, each limited by
 * its rules.
 */
export const API_KEY_KINDS = ['member', 'regular', 'management'] as const;

/** The areas a regular key works with: data. */
export const API_KEY_DATA_AREAS = [
  'contacts',
  'products',
  'payments',
  'files',
  'automations',
] as const;

/** The areas a management key works with: organisation setup. */
export const API_KEY_SETUP_AREAS = ['team', 'keys', 'plugins', 'webhooks', 'settings'] as const;

export const API_KEY_AREAS = [...API_KEY_DATA_AREAS, ...API_KEY_SETUP_AREAS] as const;

/** What a key may do in an area. */
export const API_KEY_ACCESS = ['read', 'write'] as const;

/** The languages core's emails and example data come in. */
export const LANGUAGES = ['en', 'mn'] as const;

/** How a member gets one kind of notification. */
export const NOTIFICATION_DELIVERIES = ['email', 'inbox', 'off'] as const;

/** How a customer signs in: a code sent to an email address or a phone. */
export const CUSTOMER_LOGIN_KINDS = ['email', 'phone'] as const;

/** Where a customer notification also goes besides the customer's inbox. */
export const CUSTOMER_NOTIFICATION_CHANNELS = ['email', 'sms'] as const;

/** How a broadcast reaches customers. */
export const BROADCAST_CHANNELS = ['email', 'sms'] as const;

/**
 * Where a broadcast stands: written (`draft`), waiting for its time
 * (`scheduled`), going out (`sending`), stopped by a member (`paused`), done
 * (`sent`), stopped for good (`cancelled`), or stopped by an error (`failed`).
 * A `recurring` one never sends itself: each run of its schedule sends a copy.
 */
export const BROADCAST_STATUSES = [
  'draft',
  'scheduled',
  'sending',
  'paused',
  'sent',
  'cancelled',
  'failed',
  'recurring',
] as const;

/** One recipient's copy: waiting, being sent, sent, refused by the server, or not sent (with why). */
export const BROADCAST_RECIPIENT_STATUSES = [
  'queued',
  'sending',
  'sent',
  'failed',
  'skipped',
] as const;

/** Why an address gets no more broadcasts. */
export const SUPPRESSION_REASONS = ['unsubscribed', 'bounced', 'complained', 'manual'] as const;

/** What a sign-in code is for: signing in (or up), or adding a login to a signed-in customer. */
export const CUSTOMER_CODE_PURPOSES = ['sign_in', 'add_login'] as const;

export const ORGANIZATION_STATUSES = ['active', 'suspended', 'inactive'] as const;
export const PLUGIN_TIERS = ['free', 'plus', 'pro'] as const;
export const PLUGIN_STATUSES = ['active', 'disabled'] as const;

/**
 * What a plugin may do in core, granted per organisation when it is
 * installed. A plugin only ever gets the scopes it asked for in its manifest.
 */
export const PLUGIN_SCOPES = [
  'activities:write',
  'customers:read',
  'customers:write',
  'audit:write',
  'emails:write',
  'events:read',
  'events:write',
  'fields:write',
  'files:read',
  'files:write',
  'live:write',
  'notifications:write',
  'payments:read',
  'payments:write',
  'products:read',
  'products:write',
  'secrets:write',
  'units:read',
  'units:write',
  'users:read',
  'users:write',
  'views:read',
] as const;

/** A plugin's billing status on erxes.io: `past_due` while Stripe retries, `canceling` until the period ends. */
export const ENTITLEMENT_STATUSES = ['active', 'past_due', 'canceling'] as const;

/**
 * What a plugin may do here: `full`; `warning` (payment retrying or ending
 * at period end: everything still works); `read_only` (it left the plan:
 * reads and exports for the grace period); `off` (not in the plan).
 */
export const PLUGIN_ACCESS = ['full', 'warning', 'read_only', 'off'] as const;

/**
 * Who did something: a team member, a plugin (by name, e.g. `hr`), a signed-in
 * customer, or core itself (`system`: cleanups, imports). Ids only: names are
 * resolved when shown.
 */
export const ACTOR_TYPES = ['user', 'plugin', 'customer', 'system'] as const;

// ─── Platform ───────────────────────────────────────────────────────────────

/** `deleting`: removed, waiting for storage to confirm the bytes are gone (retried until it does). */
export const FILE_STATUSES = ['pending', 'ready', 'deleting'] as const;

/** Where the server keeps uploads (FILES_STORAGE): its disk, an S3 bucket, or Cloudflare R2. */
export const FILE_STORAGES = ['local', 's3', 'cloudflare'] as const;

/**
 * Where one file's bytes are: a server storage, the organisation's own bucket
 * (`core_file_buckets`), or Cloudflare Images and Stream, where core moves
 * images and videos uploaded to R2 (CLOUDFLARE_USE_CDN).
 */
export const FILE_STORES = [
  ...FILE_STORAGES,
  'bucket',
  'cloudflare_images',
  'cloudflare_stream',
] as const;

/** What a signed local-storage link allows. */
export const FILE_GRANT_OPS = ['put', 'get'] as const;

/** How a browser gets live updates: a stream, or polling when streams are off. */
export const LIVE_MODES = ['live', 'polling'] as const;

export const STREAM_TOPICS = ['inbox', 'assistant', 'automations.catalog'] as const;

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
  'custom_field',
  'lead_stage',
  'recipients',
  'plugin_record',
  'reply_to',
] as const;

// ─── Payments ───────────────────────────────────────────────────────────────

export const PAYMENT_GATEWAY_KINDS = [
  'qpay',
  'socialpay',
  'monpay',
  'storepay',
  'pocket',
  'toki',
  'golomt',
  'tdb',
  'hipay',
  'stripe',
  'paypal',
  'wechatpay',
  'test',
] as const;

export const PAYMENT_GATEWAY_STATUSES = ['active', 'disabled'] as const;

/**
 * How an invoice was paid: through its gateway, or recorded as taken outside
 * one (cash, a card terminal, a bank transfer).
 */
export const PAYMENT_METHODS = ['gateway', 'cash', 'card', 'transfer'] as const;

/** The methods a payment taken outside a gateway is recorded with. */
export const RECORDED_PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;

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

/**
 * How a sales tax (VAT, GST) treats an invoice line, whatever the country:
 * taxed at the standard rate, zero-rated, exempt, or outside its scope (not
 * reported). A tax receipt integration maps these onto its own types.
 */
export const TAX_CATEGORIES = ['standard', 'zero', 'exempt', 'outside'] as const;

/**
 * Who issues the tax receipts for a plugin's invoices: core's integration
 * (eBarimt), or the plugin itself (`own`: sales has its own eBarimt module).
 */
export const TAX_RECEIPT_ISSUERS = ['core', 'own'] as const;

// ─── eBarimt (Mongolia's tax receipts) ──────────────────────────────────────

/** Whether paid invoices get receipts: `active`, or `disabled` with the settings kept. */
export const EBARIMT_STATUSES = ['active', 'disabled'] as const;

/** How PosAPI taxes a line: with VAT, VAT-free, 0% VAT, or left off the receipt. */
export const EBARIMT_TAX_TYPES = ['VAT_ABLE', 'VAT_FREE', 'VAT_ZERO', 'NOT_SEND'] as const;

/** `put` issues (or replaces) a receipt; `return` cancels one. */
export const EBARIMT_RECEIPT_KINDS = ['put', 'return'] as const;

export const EBARIMT_RECEIPT_STATUSES = ['pending', 'success', 'failed'] as const;

/** A receipt for a person (B2C) or a company (B2B, with its tax number). */
export const EBARIMT_BUYER_TYPES = ['B2C_RECEIPT', 'B2B_RECEIPT'] as const;

/**
 * The parts of a printed receipt, in their default order: the merchant, the
 * header text, the bill (number and date), the buyer, the lines, the totals,
 * the QR code, the lottery number and the footer text.
 */
export const EBARIMT_PRINT_BLOCKS = [
  'merchant',
  'header',
  'bill',
  'buyer',
  'lines',
  'totals',
  'qr',
  'lottery',
  'footer',
] as const;

/** The receipt printer's paper: 58 mm or 80 mm rolls, or A4. */
export const EBARIMT_PAPER_SIZES = ['58mm', '80mm', 'a4'] as const;

// ─── Settings ───────────────────────────────────────────────────────────────

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export const LOG_FORMATS = ['json', 'pretty'] as const;
export const EMAIL_DRIVERS = ['smtp', 'log'] as const;
export const SMS_DRIVERS = ['log'] as const;
