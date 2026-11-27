import { sql } from 'drizzle-orm';
import { check, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';

/**
 * Self-hosted: the erxes license core last fetched from erxes.io with `ERXES_ACTIVATION_KEY`, and how
 * its last call went. One row; deployment-wide (no organisation), so no row level security.
 * `ERXES_LICENSE`, given by hand, wins over it.
 */
export const serverLicense = pgTable(
  'server_license',
  {
    id: text().primaryKey().default('server'),
    /** The signed license (a JWT); null when erxes.io has none for this server. */
    token: text(),
    checkedAt: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
    /** Why the last call failed; null when it worked. */
    checkError: text(),
  },
  (table) => [check('core_server_license_one_row', sql`${table.id} = 'server'`)],
);
