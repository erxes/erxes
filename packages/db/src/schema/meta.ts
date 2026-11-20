import { META_APP_SOURCES, META_CONNECTION_STATUSES, META_KINDS } from '../integrationEnums';
import {
  check,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';

export const metaApps = pgTable(
  'meta_apps',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    appId: text().notNull(),
    secretSealed: text().notNull(),
    verifyToken: text().notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_meta_apps_org_key').on(table.orgId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_meta_apps_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const metaConnections = pgTable(
  'meta_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    kind: text({ enum: META_KINDS }).notNull(),
    externalId: text().notNull(),
    pageId: text().notNull(),
    name: text().notNull(),
    username: text(),
    tokenSealed: text().notNull(),
    app: text({ enum: META_APP_SOURCES }).notNull(),
    status: text({ enum: META_CONNECTION_STATUSES }).default('healthy').notNull(),
    statusReason: text(),
    connectedBy: text(),
    connectedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    checkedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_meta_connections_org_kind_external_key').on(
      table.orgId,
      table.kind,
      table.externalId,
    ),
    index('core_meta_connections_route_idx').on(
      table.kind,
      table.externalId,
      table.app,
      table.connectedAt,
    ),
    check('core_meta_connections_kind_check', inList(table.kind, META_KINDS)),
    check('core_meta_connections_app_check', inList(table.app, META_APP_SOURCES)),
    check('core_meta_connections_status_check', inList(table.status, META_CONNECTION_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_meta_connections_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const metaPeople = pgTable(
  'meta_people',
  {
    orgId: orgIdColumn(),
    kind: text({ enum: META_KINDS }).notNull(),
    externalId: text().notNull(),
    customerId: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.kind, table.externalId],
      name: 'core_meta_people_pkey',
    }),
    index('core_meta_people_org_customer_idx').on(table.orgId, table.customerId),
    check('core_meta_people_kind_check', inList(table.kind, META_KINDS)),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_meta_people_customer_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_meta_people_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const metaSends = pgTable(
  'meta_sends',
  {
    orgId: orgIdColumn(),
    idempotencyKey: text().notNull(),
    connectionId: text().notNull(),
    result: jsonb().$type<{ id: string | null }>(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.idempotencyKey],
      name: 'core_meta_sends_pkey',
    }),
    index('core_meta_sends_created_idx').on(table.createdAt),
    foreignKey({
      columns: [table.connectionId],
      foreignColumns: [metaConnections.id],
      name: 'core_meta_sends_connection_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_meta_sends_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
