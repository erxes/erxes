import { BANK_KINDS, BANK_TRANSFER_STATUSES, BANK_TRANSFER_TYPES } from '../enums';
import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';

/**
 * Money sent from one of the organisation's accounts, kept whatever the bank
 * answered: who asked, what, and the bank's reference. `reference` is ours,
 * unique per organisation: the same one is never sent twice.
 */
export const bankTransfers = pgTable(
  'bank_transfers',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** The bank connection (`core_integration_connections`) it went through; kept after it is removed. */
    connectionId: text().notNull(),
    bank: text({ enum: BANK_KINDS }).notNull(),
    reference: text().notNull(),
    type: text({ enum: BANK_TRANSFER_TYPES }).notNull(),
    fromAccount: text().notNull(),
    toAccount: text().notNull(),
    toAccountName: text(),
    toBank: text(),
    /** In the currency's smallest unit. */
    amount: bigint({ mode: 'number' }).notNull(),
    currency: text().notNull(),
    description: text().notNull(),
    status: text({ enum: BANK_TRANSFER_STATUSES }).notNull(),
    bankReference: text(),
    error: text(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    sentAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (table) => [
    uniqueIndex('core_bank_transfers_org_id_reference_key').on(table.orgId, table.reference),
    index('core_bank_transfers_org_id_created_at_idx').on(table.orgId, table.createdAt),
    check('core_bank_transfers_bank_check', inList(table.bank, BANK_KINDS)),
    check('core_bank_transfers_type_check', inList(table.type, BANK_TRANSFER_TYPES)),
    check('core_bank_transfers_status_check', inList(table.status, BANK_TRANSFER_STATUSES)),
    check('core_bank_transfers_amount_check', sql`${table.amount} > 0`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_bank_transfers_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
