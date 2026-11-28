import {
  check,
  date,
  doublePrecision,
  foreignKey,
  index,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * Exchange rates an organisation keeps by hand (3.x's Settings › Exchange rates):
 * from `date` on, 1 `rateCurrency` is worth `rate` of `mainCurrency`, until a later
 * rate of the pair. Accounting reads the rate in force on a transaction's day.
 */
export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** The day the rate starts, in the organisation's time zone. */
    date: date({ mode: 'string' }).notNull(),
    /** ISO 4217; the organisation's currency unless chosen. */
    mainCurrency: text().notNull(),
    /** ISO 4217. */
    rateCurrency: text().notNull(),
    rate: doublePrecision().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_exchange_rates_org_pair_date_key').on(
      table.orgId,
      table.mainCurrency,
      table.rateCurrency,
      table.date,
    ),
    index('core_exchange_rates_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_exchange_rates_org_id_fkey',
    }).onDelete('cascade'),
    check('core_exchange_rates_rate_check', sql`${table.rate} > 0`),
  ],
);
