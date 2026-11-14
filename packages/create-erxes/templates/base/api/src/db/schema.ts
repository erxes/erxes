import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { index, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { table } from './table.ts';

/** Names are unique per organisation, ignoring case. A write that breaks it fails with 23505. */
export const ITEM_NAME_INDEX = '__id___items_org_name_key';

/**
 * The reference table. `org_id` is the core organisation; row-level security
 * (`core_enable_tenant_rls` in the migration) shows each transaction only its
 * organisation's rows. Ids are text, so imported Mongo `_id`s fit.
 */
export const items = table(
  'items',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    orgId: text().notNull(),
    name: text().notNull(),
    description: text().notNull().default(''),
    createdBy: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('__id___items_org_created_idx').on(t.orgId, t.createdAt.desc(), t.id.desc()),
    uniqueIndex(ITEM_NAME_INDEX).on(t.orgId, sql`lower(${t.name})`),
  ],
);
