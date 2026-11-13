import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const PAYMENT_GATEWAY_KINDS = ['qpay', 'test'] as const;

export const INVOICE_STATUSES = [
  'pending',
  'paid',
  'refunded',
  'cancelled',
  'expired',
  'failed',
] as const;

/** What an invoice is for, line by line; `amount` = quantity × unit price, in the smallest unit. */
export interface InvoiceLine {
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  /** The plugin the line belongs to, when one invoice pays for several (an order and its delivery). */
  plugin: string | null;
}

export const REFUND_STATUSES = ['succeeded', 'failed'] as const;
export const REFUND_METHODS = ['gateway', 'manual'] as const;

/**
 * An organisation's payment gateway connection (QPay, …). Credentials are
 * sealed (`src/lib/secrets.ts`); the API never returns them.
 */
export const paymentGateways = pgTable(
  'payment_gateways',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    kind: text({ enum: PAYMENT_GATEWAY_KINDS }).notNull(),
    name: text().notNull(),
    /** Sealed JSON of the gateway's settings (client id, secret, invoice code, …). */
    configSealed: text().notNull(),
    status: text({ enum: ['active', 'disabled'] })
      .default('active')
      .notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_payment_gateways_org_id_id_key').on(table.orgId, table.id),
    check('core_payment_gateways_kind_check', sql`${table.kind} IN ('qpay', 'test')`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_payment_gateways_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * An invoice at a gateway, made for a plugin's (or core's) record — the
 * plugin keeps its own payment records; core keeps what the gateway needs
 * and announces `core.payment.paid`. Amounts are integers in the currency's
 * smallest unit (cents: $12.50 → 1250, ₮1,500 → 150000, ¥500 → 500).
 */
export const paymentInvoices = pgTable(
  'payment_invoices',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    gatewayId: text().notNull(),
    /** `core` or the plugin that asked for it. */
    source: text().notNull(),
    /** The plugin's own record (`order`, `abc123`). */
    referenceType: text().notNull(),
    referenceId: text().notNull(),
    /** In the currency's smallest unit (₮1,500.00 → 150000). */
    amount: bigint({ mode: 'number' }).notNull(),
    /** ISO 4217; the gateway must take it. */
    currency: text().notNull(),
    description: text().notNull(),
    status: text({ enum: INVOICE_STATUSES }).default('pending').notNull(),
    /** The gateway's id for it, and what the payer needs (QR text and image, bank links). */
    gatewayInvoiceId: text(),
    payment: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    /** The caller's own data (order lines, room number), returned in events. */
    metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    lines: jsonb().$type<InvoiceLine[]>().default([]).notNull(),
    /** What the gateway says was paid, and its payment id (for refunds). */
    paidAmount: bigint({ mode: 'number' }),
    gatewayPaymentId: text(),
    /** Refunded so far; all of it → status `refunded`. */
    refundedAmount: bigint({ mode: 'number' }).default(0).notNull(),
    expiresAt: timestamptz().notNull(),
    paidAt: timestamptz(),
    /** Retry-safe: one invoice per source and key. */
    dedupeKey: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_payment_invoices_org_id_id_key').on(table.orgId, table.id),
    index('core_payment_invoices_reference_idx').on(
      table.orgId,
      table.source,
      table.referenceType,
      table.referenceId,
    ),
    index('core_payment_invoices_pending_idx')
      .on(table.expiresAt)
      .where(sql`${table.status} = 'pending'`),
    uniqueIndex('core_payment_invoices_dedupe_key')
      .on(table.orgId, table.source, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    check(
      'core_payment_invoices_status_check',
      sql`${table.status} IN ('pending', 'paid', 'refunded', 'cancelled', 'expired', 'failed')`,
    ),
    check('core_payment_invoices_amount_check', sql`${table.amount} > 0`),
    check(
      'core_payment_invoices_refunded_check',
      sql`${table.refundedAmount} >= 0 AND ${table.refundedAmount} <= coalesce(${table.paidAmount}, ${table.amount})`,
    ),
    foreignKey({
      columns: [table.orgId, table.gatewayId],
      foreignColumns: [paymentGateways.orgId, paymentGateways.id],
      name: 'core_payment_invoices_gateway_fkey',
    }),
  ],
);

/**
 * Money given back for a paid invoice: through the gateway when it can
 * (`gateway`), or recorded after the organisation paid it back itself
 * (`manual`). Only succeeded refunds count towards `refunded_amount`.
 */
export const paymentRefunds = pgTable(
  'payment_refunds',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    invoiceId: text().notNull(),
    amount: bigint({ mode: 'number' }).notNull(),
    reason: text().notNull(),
    method: text({ enum: REFUND_METHODS }).notNull(),
    status: text({ enum: REFUND_STATUSES }).notNull(),
    gatewayRefundId: text(),
    error: text(),
    /** `user` or `plugin`, and who. */
    requestedByType: text().notNull(),
    requestedBy: text(),
    /** Retry-safe: one refund per invoice and key. */
    dedupeKey: text(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_payment_refunds_invoice_idx').on(table.orgId, table.invoiceId, table.createdAt),
    uniqueIndex('core_payment_refunds_dedupe_key')
      .on(table.orgId, table.invoiceId, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    check('core_payment_refunds_amount_check', sql`${table.amount} > 0`),
    check('core_payment_refunds_method_check', sql`${table.method} IN ('gateway', 'manual')`),
    check('core_payment_refunds_status_check', sql`${table.status} IN ('succeeded', 'failed')`),
    foreignKey({
      columns: [table.orgId, table.invoiceId],
      foreignColumns: [paymentInvoices.orgId, paymentInvoices.id],
      name: 'core_payment_refunds_invoice_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * How a plugin takes payments in an organisation, set by its owner: the
 * gateway it uses unless it names one, and the only gateways it may use
 * (none listed: any active one).
 */
export const paymentPluginSettings = pgTable(
  'payment_plugin_settings',
  {
    orgId: text().notNull(),
    plugin: text().notNull(),
    defaultGatewayId: text(),
    allowedGatewayIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    updatedBy: text(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.plugin], name: 'core_payment_plugin_settings_pkey' }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_payment_plugin_settings_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
