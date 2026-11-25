import {
  INTEGRATION_AUTH_KINDS,
  INTEGRATION_CONNECTION_STATUSES,
  INTEGRATION_STATES,
  INTEGRATION_SUBSCRIPTION_STATUSES,
} from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { pluginInstallations } from './plugins';
import { secrets } from './secrets';
import { users } from './users';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const integrationConnections = pgTable(
  'integration_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    key: text().notNull(),
    name: text().notNull(),
    settings: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    secretId: text().notNull(),
    auth: text({ enum: INTEGRATION_AUTH_KINDS }).default('keys').notNull(),
    status: text({ enum: INTEGRATION_CONNECTION_STATUSES }).default('active').notNull(),
    /** The member it is personal to; null: the whole organisation's. */
    ownerId: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_connections_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_integration_connections_org_key_name_key').on(
      table.orgId,
      table.key,
      sql`lower(${table.name})`,
      sql`coalesce(${table.ownerId}, '')`,
    ),
    check('core_integration_connections_auth_check', inList(table.auth, INTEGRATION_AUTH_KINDS)),
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
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: 'core_integration_connections_owner_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * The state a plugin last reported for one of the integrations its manifest declares
 * (`integrations.report`), shown on its tile. None: not set up.
 */
export const pluginIntegrationStates = pgTable(
  'plugin_integration_states',
  {
    orgId: orgIdColumn(),
    plugin: text().notNull(),
    key: text().notNull(),
    state: text({ enum: INTEGRATION_STATES }).notNull(),
    /** How many are connected (pages, accounts), when the plugin says. */
    count: integer(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.plugin, table.key],
      name: 'core_plugin_integration_states_pkey',
    }),
    check('core_plugin_integration_states_state_check', inList(table.state, INTEGRATION_STATES)),
    check('core_plugin_integration_states_count_check', sql`${table.count} >= 0`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_plugin_integration_states_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.plugin],
      foreignColumns: [pluginInstallations.orgId, pluginInstallations.plugin],
      name: 'core_plugin_integration_states_installation_fkey',
    }).onDelete('cascade'),
  ],
);

export const integrationOAuthApps = pgTable(
  'integration_oauth_apps',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    key: text().notNull(),
    secretId: text().notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_oauth_apps_org_id_key_key').on(table.orgId, table.key),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_oauth_apps_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.secretId],
      foreignColumns: [secrets.id],
      name: 'core_integration_oauth_apps_secret_id_fkey',
    }),
  ],
);

export const integrationSubscriptions = pgTable(
  'integration_subscriptions',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    connectionId: text().notNull(),
    app: text().notNull(),
    channel: text().notNull(),
    params: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    paramsKey: text().notNull(),
    triggers: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    status: text({ enum: INTEGRATION_SUBSCRIPTION_STATUSES }).default('syncing').notNull(),
    externalId: text(),
    routeKey: text(),
    secretId: text().notNull(),
    cursor: jsonb().$type<unknown>(),
    nextPollAt: timestamptz(),
    failures: integer().default(0).notNull(),
    lastError: text(),
    lastDeliveryAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_subscriptions_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_integration_subscriptions_identity_key').on(
      table.orgId,
      table.connectionId,
      table.channel,
      table.paramsKey,
    ),
    index('core_integration_subscriptions_due_idx')
      .on(table.nextPollAt)
      .where(sql`${table.nextPollAt} IS NOT NULL`),
    index('core_integration_subscriptions_route_idx')
      .on(table.app, table.routeKey)
      .where(sql`${table.routeKey} IS NOT NULL`),
    check(
      'core_integration_subscriptions_status_check',
      inList(table.status, INTEGRATION_SUBSCRIPTION_STATUSES),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_subscriptions_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.connectionId],
      foreignColumns: [integrationConnections.orgId, integrationConnections.id],
      name: 'core_integration_subscriptions_connection_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.secretId],
      foreignColumns: [secrets.id],
      name: 'core_integration_subscriptions_secret_id_fkey',
    }),
  ],
);
