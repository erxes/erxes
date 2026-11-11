import { sql } from 'drizzle-orm';
import { bigint, check, foreignKey, index, jsonb, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const PAYMENT_GATEWAY_KINDS = ['qpay', 'test'] as const;
export const INVOICE_STATUSES = ['pending', 'paid', 'cancelled', 'expired', 'failed'] as const;

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
    status: text({ enum: ['active', 'disabled'] }).default('active').notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_payment_gateways_org_id_id_key').on(table.orgId, table.id),
    check('core_payment_gateways_kind_check', sql`${table.kind} IN ('qpay', 'test')`),
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_payment_gateways_org_id_fkey' }).onDelete('cascade'),
  ],
);

/**
 * An invoice at a gateway, made for a plugin's (or core's) record — the
 * plugin keeps its own payment records; core keeps what the gateway needs
 * and announces `core.payment.paid`. Amounts are in hundredths of the
 * currency unit (integers: no rounding errors).
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
    /** In hundredths of the currency unit (₮1,500.00 → 150000). */
    amount: bigint({ mode: 'number' }).notNull(),
    currency: text().default('MNT').notNull(),
    description: text().notNull(),
    status: text({ enum: INVOICE_STATUSES }).default('pending').notNull(),
    /** The gateway's id for it, and what the payer needs (QR text and image, bank links). */
    gatewayInvoiceId: text(),
    payment: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    expiresAt: timestamptz().notNull(),
    paidAt: timestamptz(),
    /** Retry-safe: one invoice per source and key. */
    dedupeKey: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_payment_invoices_reference_idx').on(table.orgId, table.source, table.referenceType, table.referenceId),
    index('core_payment_invoices_pending_idx').on(table.expiresAt).where(sql`${table.status} = 'pending'`),
    uniqueIndex('core_payment_invoices_dedupe_key').on(table.orgId, table.source, table.dedupeKey).where(sql`${table.dedupeKey} IS NOT NULL`),
    check('core_payment_invoices_status_check', sql`${table.status} IN ('pending', 'paid', 'cancelled', 'expired', 'failed')`),
    check('core_payment_invoices_amount_check', sql`${table.amount} > 0`),
    foreignKey({
      columns: [table.orgId, table.gatewayId],
      foreignColumns: [paymentGateways.orgId, paymentGateways.id],
      name: 'core_payment_invoices_gateway_fkey',
    }),
  ],
);
