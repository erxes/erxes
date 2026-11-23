import {
  API_KEY_ACCESS,
  API_KEY_AREAS,
  API_KEY_DATA_AREAS,
  API_KEY_KINDS,
  API_KEY_SETUP_AREAS,
  AUDIT_STREAM_FORMATS,
  AUTOMATION_STATUSES,
  BROADCAST_CHANNELS,
  BROADCAST_RECIPIENT_STATUSES,
  BROADCAST_STATUSES,
  CUSTOMER_SEXES,
  CUSTOMER_STATES,
  EBARIMT_PAPER_SIZES,
  EBARIMT_PRINT_BLOCKS,
  EBARIMT_RECEIPT_STATUSES,
  EBARIMT_TAX_TYPES,
  FIELD_TYPES,
  FIELD_VALIDATIONS,
  INVOICE_STATUSES,
  LIVE_MODES,
  ORG_UNIT_KINDS,
  PLUGIN_LIST_TYPE,
  PRODUCT_KINDS,
  SEARCH_RECORD_TYPES,
  SUPPRESSION_REASONS,
} from '@erxes/core-db/enums';
import { INTEGRATION_CATEGORIES } from '@erxes/core-db/integrationEnums';
import {
  ASSISTANT_AVATAR_BODIES,
  ASSISTANT_AVATAR_COLORS,
  ASSISTANT_AVATAR_EXPRESSIONS,
  ASSISTANT_PROVIDERS,
  ASSISTANT_THINKING_LEVELS,
} from '@erxes/core-db/assistantEnums';
import {
  EMAIL_DELIVERY_PROVIDERS,
  EMAIL_DELIVERY_STATUSES,
  EMAIL_LANES,
  EMAIL_SOURCES,
  REPEAT_FREQUENCIES,
  REPEAT_STATES,
} from '@erxes/core-db/emailEnums';
import { z } from 'zod';

// The constants and schemas a browser uses at runtime. Nothing here builds on a
// table, so importing one never loads drizzle or `@erxes/core-db/schema`; the
// domain modules import them from here and the root re-exports them.

export const CORE_API_VERSION = 'v1';

/** Every path in the contract is under this prefix (`/core/v1/customers`, …). */
export const CORE_API_PREFIX = '/core/v1';

/** A plugin's name: its namespace everywhere (`hr` → `hr.leave.requested`, `/hr/*`). */
export const PluginName = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _ (starting with a letter)')
  .refine((name) => name !== 'core', 'reserved');

/** How long a new API key works, in days (or until it is revoked). */
export const API_KEY_LIFETIMES = [30, 90, 365] as const;

export { API_KEY_ACCESS, API_KEY_AREAS, API_KEY_DATA_AREAS, API_KEY_KINDS, API_KEY_SETUP_AREAS };

export const ApiKeyKind = z.enum(API_KEY_KINDS);
export const ApiKeyArea = z.enum(API_KEY_AREAS);
export const ApiKeyAccess = z.enum(API_KEY_ACCESS);

export type ApiKeyKind = z.infer<typeof ApiKeyKind>;

export type ApiKeyArea = z.infer<typeof ApiKeyArea>;

export type ApiKeyAccess = z.infer<typeof ApiKeyAccess>;

/** What a key may do in each area it names; an area it leaves out is closed. */
export const ApiKeyAreas = z.partialRecord(ApiKeyArea, ApiKeyAccess);

export type ApiKeyAreas = z.infer<typeof ApiKeyAreas>;

/** What a regular key may do in each installed plugin's API, by plugin name. */
export const ApiKeyPlugins = z.record(PluginName, ApiKeyAccess);

export type ApiKeyPlugins = z.infer<typeof ApiKeyPlugins>;

/**
 * Where a key does only some things: in an area, the API calls it may make
 * (`{ contacts: ['customers.create'] }` adds customers and does nothing else with contacts); in a
 * plugin, the plugin's actions it may use.
 */
export const ApiKeyActions = z.record(
  z.string().min(1).max(100),
  z.array(z.string().min(1).max(200)).min(1).max(100),
);

export type ApiKeyActions = z.infer<typeof ApiKeyActions>;

/**
 * What each area covers, as the key screens say it, and the permissions it brings when read
 * or written. A key holds its maker's permissions, its maker's role's now, and its areas', all
 * at once; to give an area the maker needs all of `read` and, to write it, one of `write`.
 */
export const API_KEY_AREA_INFO = {
  contacts: {
    label: 'Contacts',
    covers: 'Customers, companies, leads and their notes',
    read: ['contacts.view'],
    write: ['contacts.create', 'contacts.edit', 'contacts.delete', 'contacts.merge'],
  },
  products: {
    label: 'Products',
    covers: 'Products and categories',
    read: [],
    write: ['products.manage'],
  },
  payments: {
    label: 'Payments',
    covers: 'Invoices, payments, refunds and receipts',
    outsideContactLimits: true,
    read: ['payments.manage'],
    write: ['payments.refund'],
  },
  files: {
    label: 'Files',
    covers: 'Uploaded files',
    outsideContactLimits: true,
    read: [],
    write: ['files.moderate'],
  },
  automations: {
    label: 'Automations',
    covers: 'Automations and their runs',
    readOnly: true,
    outsideContactLimits: true,
    read: ['automations.view'],
    write: [],
  },
  team: {
    label: 'Team and roles',
    covers: 'Members, invitations, roles, branches and departments',
    read: ['team.view'],
    write: ['team.invite', 'team.manage', 'roles.manage', 'structure.manage'],
  },
  keys: {
    label: 'API keys',
    covers: 'See and revoke keys; keys never make keys',
    read: ['api_keys.manage'],
    write: [],
  },
  plugins: {
    label: 'Plugins',
    covers: 'Install and remove plugins',
    read: [],
    write: ['plugins.manage'],
  },
  webhooks: {
    label: 'Webhooks',
    covers: 'See, test and remove webhooks; only a signed-in member sets where they send',
    read: ['webhooks.manage'],
    write: [],
  },
  settings: {
    label: 'Settings',
    covers: 'Organisation, tags, fields, payment gateways, exchange rates',
    read: ['settings.manage', 'integrations.manage', 'payments.manage'],
    write: ['tags.manage', 'tags.delete', 'properties.manage', 'exchange_rates.manage'],
  },
} as const satisfies Record<
  ApiKeyArea,
  {
    label: string;
    covers: string;
    readOnly?: true;
    /** Its records don't follow contact limits, so a key limited to some contacts can't open it. */
    outsideContactLimits?: true;
    read: readonly string[];
    write: readonly string[];
  }
>;

/**
 * Who a plugin's API document is for (the manifest's `api.docs`): its team members in erxes
 * (with a plugin session token), employees in the plugin's own app (with a token the plugin
 * issues when they sign in, like HR's mobile app) or a portal's apps and server (`/portal/v1`,
 * with a portal token from core for one of the portal's keys, and the signed-in
 * customer's token on `/me` routes). `customer` documents the older `/customer` routes, which
 * plugins fold into `portal` as `/portal/v1/me`.
 */
export const PLUGIN_API_AUDIENCES = ['member', 'employee', 'customer', 'portal'] as const;

export type PluginApiAudience = (typeof PLUGIN_API_AUDIENCES)[number];

/**
 * The security schemes a plugin's OpenAPI document declares (`@erxes/plugin-sdk/openapi`).
 * The API reference fills in the member's session token for "try it".
 */
export const PLUGIN_SESSION_SCHEME = 'pluginSession';

export const EMPLOYEE_TOKEN_SCHEME = 'employeeToken';

export const CUSTOMER_TOKEN_SCHEME = 'customerToken';

export const PORTAL_TOKEN_SCHEME = 'portalToken';

/**
 * How an installation's granted scopes hold an approved read of another plugin's API
 * (the manifest's `pluginReads`): `reads:sales.deal.view`. The permission names its plugin.
 */
export const pluginReadScope = (permission: string) => `reads:${permission}`;

/**
 * How an installation's granted scopes hold an approved use of the organisation's connections of
 * one integration (the manifest's `connections`): `uses:facebook`.
 */
export const connectionUseScope = (integration: string) => `uses:${integration}`;

// ─── Members ────────────────────────────────────────────────────────────────

/** `owner`, `admin`, `member`, or a custom role's `r_<id>`. */
export const RoleKey = z
  .string()
  .trim()
  .regex(/^(owner|admin|member|r_[A-Za-z0-9]{6,40})$/, 'a role');

export type RoleKey = z.infer<typeof RoleKey>;

/** A role an invitation can give: any but owner, which goes to a member who has joined. */
export const InviteRole = RoleKey.refine(
  (role) => role !== 'owner',
  'invite as admin or member, then make them owner',
);

/** At least 8 characters with a lower-case letter, an upper-case letter and a digit (as old erxes). */
export const NewPassword = z
  .string()
  .min(8, 'At least 8 characters')
  .max(200)
  .regex(/[a-z]/, 'Add a lower-case letter')
  .regex(/[A-Z]/, 'Add an upper-case letter')
  .regex(/\d/, 'Add a digit');

/** Social links a member can show (old erxes `users.links`). */
export const USER_LINK_NAMES = [
  'facebook',
  'twitter',
  'website',
  'discord',
  'github',
  'instagram',
] as const;

export const UserLinkName = z.enum(USER_LINK_NAMES);

export type UserLinkName = z.infer<typeof UserLinkName>;

// ─── Records ────────────────────────────────────────────────────────────────

/** ISO/IEC 5218, as in erxes until now: 0 not known, 1 male, 2 female, 9 not applicable. */
export const CustomerSex = z.union(CUSTOMER_SEXES.map((code) => z.literal(code)));

export type CustomerSex = z.infer<typeof CustomerSex>;

/** `lead`: not a customer yet. People and companies alike. */
export const ContactState = z.enum(CUSTOMER_STATES);

export const ProductKind = z.enum(PRODUCT_KINDS);

export type ProductKind = z.infer<typeof ProductKind>;

/**
 * In a list of branch or department ids to sum stock over, the stock with no branch (or no
 * department), as 3.x's inventory keys named it.
 */
export const NO_PLACE = '_';

/** Where a member works (`branch`) or what they do (`department`). */
export const UnitKind = z.enum(ORG_UNIT_KINDS);

export type UnitKind = z.infer<typeof UnitKind>;

/** What global search finds in core, in the order its groups show. */
export const SearchType = z.enum(SEARCH_RECORD_TYPES);

export type SearchType = z.infer<typeof SearchType>;

/** A plugin's list, `<plugin>:<record>` (`sales:deal`): views belong to it, imports and exports carry its records. */
export const PluginListType = z
  .templateLiteral([z.string(), ':', z.string()])
  .refine((type) => new RegExp(PLUGIN_LIST_TYPE).test(type), 'Expected <plugin>:<record>');

/**
 * What a plugin's search route (`search[].path` in its manifest) answers:
 * `GET <api.url><path>?q=<text>&limit=<n>` with the member's plugin session
 * token, at most `limit` (≤ 20) records the member may see. A hit opens in
 * core's side panel when it names a `recordType` the plugin UI registers
 * (`sales:deal`), else at `path`, a route of the plugin UI.
 */
export const PluginSearchHit = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).nullish(),
  recordType: PluginListType.optional(),
  path: z
    .string()
    .regex(/^\/[^\s]*$/, 'a path like /sales/deals/1')
    .max(500)
    .optional(),
});

export type PluginSearchHit = z.infer<typeof PluginSearchHit>;

export const PluginSearchResults = z.object({ data: z.array(PluginSearchHit).max(20) });

// ─── Custom fields ──────────────────────────────────────────────────────────

export const FieldType = z.enum(FIELD_TYPES);

export type FieldType = z.infer<typeof FieldType>;

/** Field types whose values are chosen from `options`. */
export const OPTION_FIELD_TYPES: readonly FieldType[] = ['select', 'multiselect', 'radio', 'check'];

/**
 * Types sharing a stored value: a field holding values may only change within
 * its family; an unused field may become any type.
 */
export const FIELD_TYPE_FAMILIES: readonly (readonly FieldType[])[] = [
  ['select', 'radio'],
  ['multiselect', 'check'],
  ['text', 'textarea', 'phone'],
];

/** Format a text field's values must have. */
export const FieldValidation = z.enum(FIELD_VALIDATIONS);

export type FieldValidation = z.infer<typeof FieldValidation>;

// ─── Automations and audit ──────────────────────────────────────────────────

export const AutomationStatus = z.enum(AUTOMATION_STATUSES);

/** Who changed what in core (owners and admins). */
export const AuditStreamFormat = z.enum(AUDIT_STREAM_FORMATS);

// ─── Payments and integrations ──────────────────────────────────────────────

export const InvoiceStatus = z.enum(INVOICE_STATUSES);

export const IntegrationCategory = z.enum(INTEGRATION_CATEGORIES);

export type IntegrationCategory = z.infer<typeof IntegrationCategory>;

/** An integration's key, core's (`qpay`) or one a plugin declares (`facebook`). */
export const IntegrationKey = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,39}$/, 'lowercase letters, digits and dashes');

export const appEventType = (app: string, trigger: string) =>
  `app.${app.replaceAll('-', '_')}.${trigger}`;

export const isAppEvent = (type: string) => type.startsWith('app.');

/** Core's areas, by the second part of a type (`core.<area>.…`). */
const CORE_AREAS: Record<string, string> = {
  customer: 'customers',
  lead: 'leads',
  company: 'companies',
  payment: 'payments',
  ebarimt: 'payments',
  product: 'products',
  email: 'messages',
  notification: 'messages',
  broadcast: 'messages',
  note: 'timeline',
  webhook: 'integrations',
  http: 'integrations',
  integration: 'integrations',
  automation: 'automations',
};

/**
 * Where the builder files an event or action: `integration:<key>`, `plugin:<name>`, or
 * `core:<area>` (`core:messages`).
 */
export const catalogCategory = (item: {
  type: string;
  source: string;
  integration?: string | null;
}) => {
  if (item.integration) return `integration:${item.integration}`;

  if (item.source !== 'core') return `plugin:${item.source}`;

  return `core:${CORE_AREAS[item.type.split('.')[1] ?? ''] ?? 'general'}`;
};

// ─── Broadcasts ─────────────────────────────────────────────────────────────

export const BroadcastChannel = z.enum(BROADCAST_CHANNELS);

export const BroadcastStatus = z.enum(BROADCAST_STATUSES);

export const BroadcastRecipientStatus = z.enum(BROADCAST_RECIPIENT_STATUSES);

export const SuppressionReason = z.enum(SUPPRESSION_REASONS);

/** Files an email broadcast attaches to every copy: at most this many… */
export const BROADCAST_ATTACHMENTS_MAX = 5;

/** …and this many MB together. */
export const BROADCAST_ATTACHMENTS_MAX_MB = 10;

/** A recurring broadcast repeats every N days, weeks or months. */
export const RepeatFrequency = z.enum(REPEAT_FREQUENCIES);

/** A recurring broadcast's schedule: saved, running, held, or done. */
export const RepeatState = z.enum(REPEAT_STATES);

// ─── Email delivery log ─────────────────────────────────────────────────────

/** What an email was for (`core_email_deliveries.source`). */
export const EmailSource = z.enum(EMAIL_SOURCES);

/** Where an email stands: queued, sent, failed, reported by the provider, or not sent (suppressed, held, capped). */
export const EmailDeliveryStatus = z.enum(EMAIL_DELIVERY_STATUSES);

/** How an email goes out: SMTP, SendGrid, Amazon SES, or only into the server's log. */
export const EmailProvider = z.enum(EMAIL_DELIVERY_PROVIDERS);

/** An address's standing: `proven`, `unknown` or `suppressed`. */
export const EmailLane = z.enum(EMAIL_LANES);

/** What `{{ firstName | there }}` in a broadcast fills in: each customer's value, or the organisation's name. */
export const BROADCAST_PLACEHOLDERS = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'code',
  'position',
  'organization',
] as const;

export type BroadcastPlaceholder = (typeof BROADCAST_PLACEHOLDERS)[number];

/** The nodes and marks an email's document may hold; the email editor offers only these. */
export { EMAIL_MARK_TYPES, EMAIL_NODE_TYPES } from '@erxes/core-db/emailEnums';

/** Who traded a portal token (`knd`): a portal key's kind, or core's agent. */
export { PORTAL_KEY_KINDS, PORTAL_TOKEN_KINDS } from '@erxes/core-db/enums';

export { AutomationDefinition } from '@erxes/core-db/automationDefinition';

// ─── eBarimt ────────────────────────────────────────────────────────────────

/** How eBarimt taxes a product's lines (Settings › Integrations › eBarimt). */
export const EbarimtTaxType = z.enum(EBARIMT_TAX_TYPES);

export type EbarimtTaxType = z.infer<typeof EbarimtTaxType>;

export const EbarimtReceiptStatus = z.enum(EBARIMT_RECEIPT_STATUSES);

/** A part of a printed receipt, in its default order. */
export const EbarimtPrintBlockType = z.enum(EBARIMT_PRINT_BLOCKS);

export type EbarimtPrintBlockType = z.infer<typeof EbarimtPrintBlockType>;

/** The paper a receipt prints on: a 58 or 80 mm roll, or A4. */
export const EbarimtPaperSize = z.enum(EBARIMT_PAPER_SIZES);

export type EbarimtPaperSize = z.infer<typeof EbarimtPaperSize>;

// ─── Live updates and the assistant ─────────────────────────────────────────
// (Notification groups and kinds are in `notificationGroups.ts`.)

/** How the live stream reaches this browser, in its `hello` event: pushing, or polling while it can't listen. */
export const LiveMode = z.enum(LIVE_MODES);

export const AssistantProvider = z.enum(ASSISTANT_PROVIDERS);

export type AssistantProvider = z.infer<typeof AssistantProvider>;

export const AssistantThinkingLevel = z.enum(ASSISTANT_THINKING_LEVELS);

export type AssistantThinkingLevel = z.infer<typeof AssistantThinkingLevel>;

export const AssistantAvatarBody = z.enum(ASSISTANT_AVATAR_BODIES);

export const AssistantAvatarColor = z.enum(ASSISTANT_AVATAR_COLORS);

export const AssistantAvatarExpression = z.enum(ASSISTANT_AVATAR_EXPRESSIONS);
