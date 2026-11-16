import {
  AUDIT_STREAM_FORMATS,
  AUTOMATION_STATUSES,
  BROADCAST_CHANNELS,
  BROADCAST_RECIPIENT_STATUSES,
  BROADCAST_STATUSES,
  CUSTOMER_SEXES,
  CUSTOMER_STATES,
  EBARIMT_RECEIPT_STATUSES,
  EBARIMT_TAX_TYPES,
  FIELD_TYPES,
  FIELD_VALIDATIONS,
  INVOICE_STATUSES,
  LIVE_MODES,
  NOTIFICATION_DELIVERIES,
  ORG_UNIT_KINDS,
  PLUGIN_VIEW_TYPE,
  PRODUCT_KINDS,
  SEARCH_RECORD_TYPES,
  SUPPRESSION_REASONS,
} from '@erxes/core-db/enums';
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

/**
 * Who a plugin's API document is for (the manifest's `api.docs`): its team members in erxes
 * (with a plugin session token), employees in the plugin's own app (with a token the plugin
 * issues when they sign in, like HR's mobile app), customers (with a customer token from
 * core) or a website's server (with a key the plugin issues).
 */
export const PLUGIN_API_AUDIENCES = ['member', 'employee', 'customer', 'website'] as const;

export type PluginApiAudience = (typeof PLUGIN_API_AUDIENCES)[number];

/**
 * The security schemes a plugin's OpenAPI document declares (`@erxes/plugin-sdk/openapi`).
 * The API reference fills in the member's session token for "try it".
 */
export const PLUGIN_SESSION_SCHEME = 'pluginSession';

export const EMPLOYEE_TOKEN_SCHEME = 'employeeToken';

export const CUSTOMER_TOKEN_SCHEME = 'customerToken';

export const WEBSITE_KEY_SCHEME = 'websiteKey';

/**
 * How an installation's granted scopes hold an approved read of another plugin's API
 * (the manifest's `pluginReads`): `reads:sales.deal.view`. The permission names its plugin.
 */
export const pluginReadScope = (permission: string) => `reads:${permission}`;

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

/** Where a member works (`branch`) or what they do (`department`). */
export const UnitKind = z.enum(ORG_UNIT_KINDS);

export type UnitKind = z.infer<typeof UnitKind>;

/** What global search finds in core, in the order its groups show. */
export const SearchType = z.enum(SEARCH_RECORD_TYPES);

export type SearchType = z.infer<typeof SearchType>;

/** A plugin's record type, `<plugin>:<record>` (`sales:deal`). */
export const PluginViewType = z
  .templateLiteral([z.string(), ':', z.string()])
  .refine((type) => new RegExp(PLUGIN_VIEW_TYPE).test(type), 'Expected <plugin>:<record>');

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
  recordType: PluginViewType.optional(),
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

// ─── Payments (gateways: `./paymentGateways`) ───────────────────────────────

export const InvoiceStatus = z.enum(INVOICE_STATUSES);

export const BroadcastChannel = z.enum(BROADCAST_CHANNELS);
export const BroadcastStatus = z.enum(BROADCAST_STATUSES);
export const BroadcastRecipientStatus = z.enum(BROADCAST_RECIPIENT_STATUSES);
export const SuppressionReason = z.enum(SUPPRESSION_REASONS);

/** How eBarimt taxes a product's lines (Settings › Integrations › eBarimt). */
export const EbarimtTaxType = z.enum(EBARIMT_TAX_TYPES);

export type EbarimtTaxType = z.infer<typeof EbarimtTaxType>;

export const EbarimtReceiptStatus = z.enum(EBARIMT_RECEIPT_STATUSES);

// ─── Notifications ──────────────────────────────────────────────────────────

/** Security notices a member can't mute. */
export const UNMUTABLE_NOTIFICATION_KINDS: readonly string[] = [
  'core.user.role_changed',
  'core.user.password_set',
  'core.security.mass_deletion',
  'core.security.alert',
  'core.security.new_sign_in',
];

/** Where a group of notifications goes: the inbox and email, the inbox only, or nowhere. */
export const NotificationDelivery = z.enum(NOTIFICATION_DELIVERIES);

export type NotificationDelivery = z.infer<typeof NotificationDelivery>;

/** How the live stream reaches this browser, in its `hello` event: pushing, or polling while it can't listen. */
export const LiveMode = z.enum(LIVE_MODES);

/**
 * Core's notifications in groups a member chooses for at once (each plugin
 * is a group of its own). `security` is always on.
 */
export const CORE_NOTIFICATION_GROUPS = [
  {
    key: 'assigned',
    label: 'Assigned to me',
    kinds: ['core.customer.assigned', 'core.company.assigned'],
    default: 'email',
  },
  {
    key: 'records',
    label: 'Changes to records I own',
    kinds: [
      'core.customer.updated',
      'core.customer.merged',
      'core.customer.deleted',
      'core.company.updated',
      'core.company.merged',
      'core.company.deleted',
      'core.customer.activity',
      'core.company.activity',
    ],
    default: 'inbox',
  },
  { key: 'mentions', label: 'Mentions', kinds: ['core.note.mentioned'], default: 'email' },
  {
    key: 'automations',
    label: 'Automations',
    kinds: ['core.automation.message', 'core.automation.failed'],
    default: 'inbox',
  },
  {
    key: 'transfer',
    label: 'Imports and exports',
    kinds: ['core.import.done', 'core.export.ready'],
    default: 'inbox',
  },
  { key: 'security', label: 'Security', kinds: UNMUTABLE_NOTIFICATION_KINDS, default: 'inbox' },
] as const satisfies readonly {
  key: string;
  label: string;
  kinds: readonly string[];
  default: NotificationDelivery;
}[];

/** The group a notification belongs to: a core group, or the plugin that sent it. */
export const notificationGroupOf = (source: string, kind: string) =>
  source === 'core'
    ? (CORE_NOTIFICATION_GROUPS.find((group) => (group.kinds as readonly string[]).includes(kind))
        ?.key ?? 'records')
    : source;
