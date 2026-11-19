import {
  ASSISTANT_AVATAR_BODIES,
  ASSISTANT_AVATAR_COLORS,
  ASSISTANT_AVATAR_EXPRESSIONS,
  ASSISTANT_PROVIDERS,
  ASSISTANT_RECORD_TYPES,
} from '../assistantEnums';
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/** The organisation's model provider keys, one per provider, which every agent uses. */
export const assistantConnections = pgTable(
  'assistant_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    provider: text({ enum: ASSISTANT_PROVIDERS }).notNull(),
    sealedKey: text().notNull(),
    isDefault: boolean().default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_assistant_connections_provider_key').on(table.orgId, table.provider),
    uniqueIndex('core_assistant_connections_default_key')
      .on(table.orgId)
      .where(sql`${table.isDefault}`),
    check('core_assistant_connections_provider_check', inList(table.provider, ASSISTANT_PROVIDERS)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_connections_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const assistantThreads = pgTable(
  'assistant_threads',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    title: text(),
    pinned: boolean().default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_assistant_threads_user_updated_idx').on(
      table.orgId,
      table.userId,
      table.updatedAt.desc(),
      table.id.desc(),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_threads_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const assistantReferences = pgTable(
  'assistant_references',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    threadId: text().notNull(),
    recordType: text({ enum: ASSISTANT_RECORD_TYPES }).notNull(),
    recordId: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex('core_assistant_references_thread_record_key').on(
      table.orgId,
      table.threadId,
      table.recordType,
      table.recordId,
    ),
    check(
      'core_assistant_references_record_type_check',
      inList(table.recordType, ASSISTANT_RECORD_TYPES),
    ),
    foreignKey({
      columns: [table.threadId],
      foreignColumns: [assistantThreads.id],
      name: 'core_assistant_references_thread_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_references_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const assistantSettings = pgTable(
  'assistant_settings',
  {
    orgId: orgIdColumn().primaryKey(),
    codeMode: boolean().default(false).notNull(),
    updatedAt: updatedAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_settings_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const assistantAppearances = pgTable(
  'assistant_appearances',
  {
    orgId: orgIdColumn(),
    userId: text().notNull(),
    body: text({ enum: ASSISTANT_AVATAR_BODIES }).default('circle').notNull(),
    color: text({ enum: ASSISTANT_AVATAR_COLORS }).default('ink').notNull(),
    expression: text({ enum: ASSISTANT_AVATAR_EXPRESSIONS }).default('neutral').notNull(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ name: 'core_assistant_appearances_pkey', columns: [table.orgId, table.userId] }),
    check('core_assistant_appearances_body_check', inList(table.body, ASSISTANT_AVATAR_BODIES)),
    check('core_assistant_appearances_color_check', inList(table.color, ASSISTANT_AVATAR_COLORS)),
    check(
      'core_assistant_appearances_expression_check',
      inList(table.expression, ASSISTANT_AVATAR_EXPRESSIONS),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_appearances_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
