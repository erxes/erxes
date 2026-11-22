import {
  CORE_CONNECTION_STATUSES,
  INTEGRATION_CONNECTION_STATUSES,
  PLUGIN_CONNECTION_STATUSES,
} from '../enums';
import { sql } from 'drizzle-orm';
import { check, foreignKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { pluginInstallations } from './plugins';
import { secrets } from './secrets';

export const integrationConnections = pgTable(
  'integration_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    plugin: text(),
    key: text().notNull(),
    name: text().notNull(),
    secretId: text().notNull(),
    status: text({ enum: INTEGRATION_CONNECTION_STATUSES }).default('active').notNull(),
    problem: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_connections_org_id_id_key').on(table.orgId, table.id),
    check(
      'core_integration_connections_status_check',
      sql`CASE WHEN ${table.plugin} IS NULL THEN ${inList(table.status, CORE_CONNECTION_STATUSES)} ELSE ${inList(table.status, PLUGIN_CONNECTION_STATUSES)} END`,
    ),
    check(
      'core_integration_connections_problem_check',
      sql`(${table.status} = 'attention') = (${table.problem} IS NOT NULL)`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_connections_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.plugin],
      foreignColumns: [pluginInstallations.orgId, pluginInstallations.plugin],
      name: 'core_integration_connections_installation_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.secretId],
      foreignColumns: [secrets.id],
      name: 'core_integration_connections_secret_id_fkey',
    }),
  ],
);
