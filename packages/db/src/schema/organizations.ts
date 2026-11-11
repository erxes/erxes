import { sql } from 'drizzle-orm';
import { text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';

/** A tenant. `id` is permanent; `subdomain` may change (never reused). */
export const organizations = pgTable(
  'organizations',
  {
    id: text().primaryKey(),
    subdomain: text().notNull(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('core_organizations_subdomain_key').on(
      sql`lower(${table.subdomain})`,
    ),
  ],
);
