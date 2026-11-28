import {
  ACTOR_TYPES,
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  REFUND_METHODS,
  REFUND_STATUSES,
  type TAX_CATEGORIES,
} from '../enums';
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { integrationConnections } from './integrations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/** What an invoice is for, line by line; `amount` = quantity × unit price, in the smallest unit. */
export interface InvoiceLine {
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  /** The plugin the line belongs to, when one invoice pays for several (an order and its delivery). */
  plugin: string | null;
  /** The item's barcode, for lines without a core product (a product's own barcode wins). */
  barcode?: string;
  /**
   * How sales tax treats the line, for lines the organisation's tax rules
   * don't cover; `code` is the tax office's code for an exempt or zero-rated item.
   */
  tax?: { category: (typeof TAX_CATEGORIES)[number]; code?: string };
}

/**
 * Who a paid invoice's tax receipt is for (eBarimt): a company by its
 * registration or tax number, or a person by their eBarimt consumer number.
 * None: a receipt for a person.
 */
export interface TaxBuyer {
  companyNo?: string;
  consumerNo?: string;
}

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
    orgId: orgIdColumn(),
    /** Null for a payment recorded as taken outside a gateway (`method`). */
    gatewayId: text(),
    /** `gateway`, or how a payment taken outside one was made (cash, card, transfer). */
    method: text({ enum: PAYMENT_METHODS }).default('gateway').notNull(),
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
    taxBuyer: jsonb().$type<TaxBuyer>(),
    /** Send an eBarimt receipt once it is paid; false: this order needs none. */
    taxReceipt: boolean().default(true).notNull(),
    /** The eBarimt config that issues its receipt; null: the organisation's default. */
    ebarimtId: text(),
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
    check('core_payment_invoices_status_check', inList(table.status, INVOICE_STATUSES)),
    check('core_payment_invoices_amount_check', sql`${table.amount} > 0`),
    check('core_payment_invoices_method_check', inList(table.method, PAYMENT_METHODS)),
    check(
      'core_payment_invoices_gateway_check',
      sql`(${table.method} = 'gateway') = (${table.gatewayId} IS NOT NULL)`,
    ),
    check(
      'core_payment_invoices_refunded_check',
      sql`${table.refundedAmount} >= 0 AND ${table.refundedAmount} <= coalesce(${table.paidAmount}, ${table.amount})`,
    ),
    foreignKey({
      columns: [table.orgId, table.gatewayId],
      foreignColumns: [integrationConnections.orgId, integrationConnections.id],
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
    orgId: orgIdColumn(),
    invoiceId: text().notNull(),
    amount: bigint({ mode: 'number' }).notNull(),
    reason: text().notNull(),
    method: text({ enum: REFUND_METHODS }).notNull(),
    status: text({ enum: REFUND_STATUSES }).notNull(),
    gatewayRefundId: text(),
    error: text(),
    /** `user` or `plugin`, and who. */
    requestedByType: text({ enum: ACTOR_TYPES }).notNull(),
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
    check('core_payment_refunds_method_check', inList(table.method, REFUND_METHODS)),
    check('core_payment_refunds_status_check', inList(table.status, REFUND_STATUSES)),
    foreignKey({
      columns: [table.orgId, table.invoiceId],
      foreignColumns: [paymentInvoices.orgId, paymentInvoices.id],
      name: 'core_payment_refunds_invoice_fkey',
    }).onDelete('cascade'),
  ],
);
