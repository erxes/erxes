import { INTEGRATION_CONNECTION_STATUSES } from '../enums';
import { foreignKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { secrets } from './secrets';

export const integrationConnections = pgTable(
  'integration_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    key: text().notNull(),
    name: text().notNull(),
    secretId: text().notNull(),
    status: text({ enum: INTEGRATION_CONNECTION_STATUSES }).default('active').notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_connections_org_id_id_key').on(table.orgId, table.id),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_connections_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.secretId],
      foreignColumns: [secrets.id],
      name: 'core_integration_connections_secret_id_fkey',
    }),
  ],
);
