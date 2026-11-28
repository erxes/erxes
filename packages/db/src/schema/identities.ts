import { foreignKey, index, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

/**
 * A member's account in another system that signs them in: a plugin's sign-in provider (a company
 * directory) and the id it knows them by (`subject`: an LDAP objectGUID, an OIDC `sub`). The id
 * stays when their name or email changes there, so they keep their member here.
 */
export const userIdentities = pgTable(
  'user_identities',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    /** The plugin that signs them in. */
    provider: text().notNull(),
    subject: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('core_user_identities_org_provider_subject_key').on(
      table.orgId,
      table.provider,
      table.subject,
    ),
    index('core_user_identities_user_idx').on(table.orgId, table.userId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_user_identities_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_user_identities_user_id_fkey',
    }).onDelete('cascade'),
  ],
);
