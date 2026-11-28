import { foreignKey, index, text } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

export const secrets = pgTable(
  'secrets',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    owner: text().notNull(),
    keyId: text().notNull(),
    sealed: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_secrets_org_idx').on(table.orgId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_secrets_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
