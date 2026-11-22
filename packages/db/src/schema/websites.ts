import { sql } from 'drizzle-orm';
import { foreignKey, index, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * A website or app customers sign in to (decision 42): a plugin's store, hotel or tour site.
 * The plugin keeps it in step with its own record; each website has its own accounts.
 */
export const websites = pgTable(
  'websites',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** The plugin whose record it is. */
    plugin: text().notNull(),
    /** That record's id in the plugin, such as a store's. */
    recordId: text().notNull(),
    name: text().notNull(),
    /** Where browsers call from: `https://shop.example.mn`, `http://localhost:3000`. */
    origins: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_websites_org_plugin_record_key').on(
      table.orgId,
      table.plugin,
      table.recordId,
    ),
    // CORS asks across organisations whether any website runs at an origin.
    index('core_websites_origins_idx').using('gin', table.origins),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_websites_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
