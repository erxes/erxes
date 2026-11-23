import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { EBARIMT_PRINT_BLOCKS, EBARIMT_TAX_TYPES } from '../enums';
import {
  EBARIMT_BUYER_TYPES,
  EBARIMT_PAPER_SIZES,
  EBARIMT_RECEIPT_KINDS,
  EBARIMT_RECEIPT_STATUSES,
  EBARIMT_STATUSES,
} from '../enums';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { paymentInvoices } from './payments';

// eBarimt, Mongolia's tax receipts. An organisation turns it on in Settings ›
// Integrations; core then sends a receipt to the merchant's PosAPI (a service
// the tax office gives each merchant) for every paid invoice, except a plugin's
// that sends its own, and returns or replaces it when the invoice is refunded.

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/** Lines of these products, or of products in these categories, are taxed this way. */
export interface EbarimtTaxRule {
  productIds: string[];
  categoryIds: string[];
  taxType: (typeof EBARIMT_TAX_TYPES)[number];
  /** The tax office's code for a VAT-free or 0% product. */
  taxCode: string | null;
}

/** The organisation's eBarimt integration; none: not installed. */
/**
 * One eBarimt config: a merchant's PosAPI and how its receipts are taxed. An organisation may
 * keep several (a branch, another merchant TIN); its default issues an invoice's receipt unless
 * the invoice names another (`ebarimtId`).
 */
export const ebarimtSettings = pgTable(
  'ebarimt_settings',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** What staff call it: `Main shop`, `Airport branch`. */
    name: text().notNull(),
    isDefault: boolean().default(false).notNull(),
    status: text({ enum: EBARIMT_STATUSES }).default('active').notNull(),
    /** The merchant's PosAPI 3.0, for example `https://posapi.example.mn`. */
    posApiUrl: text().notNull(),
    companyName: text().notNull(),
    merchantTin: text().notNull(),
    posNo: text().default('').notNull(),
    districtCode: text().notNull(),
    branchNo: text().default('').notNull(),
    /** 0: the merchant doesn't pay VAT. */
    vatPercent: doublePrecision().default(10).notNull(),
    cityTaxPercent: doublePrecision().default(0).notNull(),
    /** The product classification code sent on every line. */
    classificationCode: text().default('').notNull(),
    rules: jsonb().$type<EbarimtTaxRule[]>().default([]).notNull(),
    updatedBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_ebarimt_settings_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_ebarimt_settings_default_key')
      .on(table.orgId)
      .where(sql`${table.isDefault}`),
    check('core_ebarimt_settings_status_check', inList(table.status, EBARIMT_STATUSES)),
    check(
      'core_ebarimt_settings_percent_check',
      sql`${table.vatPercent} >= 0 AND ${table.vatPercent} <= 100 AND ${table.cityTaxPercent} >= 0 AND ${table.cityTaxPercent} <= 100`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_ebarimt_settings_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * What core sent PosAPI for an invoice. A `put` issues a receipt, or replaces
 * `previousId`'s after a partial refund or a new buyer; a `return` cancels
 * `previousId`'s. A put that was returned or replaced has `inactiveAt`.
 * Amounts are in the smallest unit, as the invoice's. One pending receipt per
 * invoice at a time: it is the lock while PosAPI is asked.
 */
export const ebarimtReceipts = pgTable(
  'ebarimt_receipts',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    invoiceId: text().notNull(),
    /**
     * The config that sent it; a return or replacement goes through the same PosAPI. Null for
     * receipts of a setup removed before configs; a config with receipts can't be removed.
     */
    settingsId: text(),
    kind: text({ enum: EBARIMT_RECEIPT_KINDS }).notNull(),
    status: text({ enum: EBARIMT_RECEIPT_STATUSES }).default('pending').notNull(),
    previousId: text(),
    buyerType: text({ enum: EBARIMT_BUYER_TYPES }).notNull(),
    customerTin: text(),
    customerName: text(),
    consumerNo: text(),
    totalAmount: bigint({ mode: 'number' }).default(0).notNull(),
    totalVat: bigint({ mode: 'number' }).default(0).notNull(),
    totalCityTax: bigint({ mode: 'number' }).default(0).notNull(),
    /** PosAPI's answer: the bill's id and date, the lottery number and the QR text. */
    billId: text(),
    billDate: text(),
    lottery: text(),
    qrData: text(),
    error: text(),
    request: jsonb().$type<Record<string, unknown>>(),
    response: jsonb().$type<unknown>(),
    inactiveAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_ebarimt_receipts_org_id_id_key').on(table.orgId, table.id),
    index('core_ebarimt_receipts_invoice_idx').on(table.orgId, table.invoiceId, table.createdAt),
    index('core_ebarimt_receipts_created_idx').on(table.orgId, table.createdAt),
    uniqueIndex('core_ebarimt_receipts_pending_key')
      .on(table.orgId, table.invoiceId)
      .where(sql`${table.status} = 'pending'`),
    check('core_ebarimt_receipts_kind_check', inList(table.kind, EBARIMT_RECEIPT_KINDS)),
    check('core_ebarimt_receipts_status_check', inList(table.status, EBARIMT_RECEIPT_STATUSES)),
    check('core_ebarimt_receipts_buyer_type_check', inList(table.buyerType, EBARIMT_BUYER_TYPES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_ebarimt_receipts_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.invoiceId],
      foreignColumns: [paymentInvoices.orgId, paymentInvoices.id],
      name: 'core_ebarimt_receipts_invoice_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.previousId],
      foreignColumns: [table.orgId, table.id],
      name: 'core_ebarimt_receipts_previous_fkey',
    }),
  ],
);

/** One part of a printed receipt, in its place; `visible: false` leaves it off. */
export interface EbarimtPrintBlock {
  type: (typeof EBARIMT_PRINT_BLOCKS)[number];
  visible: boolean;
}

/**
 * How a plugin's receipts print: the paper, the parts in order and the
 * header and footer text. None: core's default for that plugin.
 */
export const ebarimtPrintTemplates = pgTable(
  'ebarimt_print_templates',
  {
    orgId: orgIdColumn(),
    /** A plugin eBarimt issues receipts for (`core` for core's own). */
    plugin: text().notNull(),
    paperSize: text({ enum: EBARIMT_PAPER_SIZES }).default('80mm').notNull(),
    blocks: jsonb().$type<EbarimtPrintBlock[]>().default([]).notNull(),
    headerText: text().default('').notNull(),
    footerText: text().default('').notNull(),
    updatedBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.plugin],
      name: 'core_ebarimt_print_templates_pkey',
    }),
    check(
      'core_ebarimt_print_templates_paper_size_check',
      inList(table.paperSize, EBARIMT_PAPER_SIZES),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_ebarimt_print_templates_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
