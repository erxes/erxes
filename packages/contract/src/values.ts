import {
  AUDIT_STREAM_FORMATS,
  AUTOMATION_STATUSES,
  CUSTOMER_SEXES,
  FIELD_TYPES,
  FIELD_VALIDATIONS,
  INVOICE_STATUSES,
  NOTIFICATION_DELIVERIES,
  PAYMENT_GATEWAY_KINDS,
  PRODUCT_KINDS,
} from '@erxes/core-db/enums';
import { z } from 'zod';

// The constants and schemas a browser uses at runtime. Nothing here builds on a
// table, so importing one never loads drizzle or `@erxes/core-db/schema`; the
// domain modules import them from here and the root re-exports them.

export const CORE_API_VERSION = 'v1';

/** Every path in the contract is under this prefix (`/core/v1/customers`, …). */
export const CORE_API_PREFIX = '/core/v1';

// ─── Members ────────────────────────────────────────────────────────────────

/** `owner`, `admin`, `member`, or a custom role's `r_<id>`. */
export const RoleKey = z
  .string()
  .trim()
  .regex(/^(owner|admin|member|r_[A-Za-z0-9]{6,40})$/, 'a role');

export type RoleKey = z.infer<typeof RoleKey>;

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

export const ProductKind = z.enum(PRODUCT_KINDS);

export type ProductKind = z.infer<typeof ProductKind>;

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

// ─── Payments ───────────────────────────────────────────────────────────────

/**
 * The gateways core can connect, and where each works: the currencies it
 * takes and the countries it serves (empty: any). QPay is Mongolian; global
 * ones (Stripe …) join here as drivers in `@erxes/payment-gateways`.
 */
export const PAYMENT_GATEWAYS = {
  qpay: { currencies: ['MNT'], countries: ['MN'] },
  test: { currencies: [], countries: [] },
} as const satisfies Record<string, { currencies: string[]; countries: string[] }>;

export const PaymentGatewayKind = z.enum(PAYMENT_GATEWAY_KINDS);

export type PaymentGatewayKind = z.infer<typeof PaymentGatewayKind>;

/** Does this kind of gateway take this currency? */
export const gatewayTakes = (kind: PaymentGatewayKind, currency: string) => {
  const { currencies } = PAYMENT_GATEWAYS[kind];

  return currencies.length === 0 || currencies.some((code) => code === currency);
};

export const InvoiceStatus = z.enum(INVOICE_STATUSES);

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
