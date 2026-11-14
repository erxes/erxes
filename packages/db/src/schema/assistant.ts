import { ASSISTANT_APPROVAL_MODES, ASSISTANT_MESSAGE_ROLES, ASSISTANT_PROVIDERS } from '../enums';
import { sql } from 'drizzle-orm';
import {
  boolean,
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

export interface AssistantMessagePart {
  type: string;
  [field: string]: unknown;
}

export const assistantConnections = pgTable(
  'assistant_connections',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    provider: text({ enum: ASSISTANT_PROVIDERS }).notNull(),
    sealedKey: text().notNull(),
    isDefault: boolean().default(false).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_assistant_connections_user_provider_key').on(
      table.orgId,
      table.userId,
      table.provider,
    ),
    uniqueIndex('core_assistant_connections_user_default_key')
      .on(table.orgId, table.userId)
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

    runningSince: timestamp({ withTimezone: true, mode: 'date' }),
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

export const assistantMessages = pgTable(
  'assistant_messages',
  {
    threadId: text().notNull(),
    id: text().notNull(),
    orgId: orgIdColumn(),
    role: text({ enum: ASSISTANT_MESSAGE_ROLES }).notNull(),
    parts: jsonb().$type<AssistantMessagePart[]>().notNull(),
    position: integer().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({ columns: [table.threadId, table.id], name: 'core_assistant_messages_pkey' }),
    uniqueIndex('core_assistant_messages_thread_position_key').on(table.threadId, table.position),
    index('core_assistant_messages_org_thread_idx').on(table.orgId, table.threadId),
    check('core_assistant_messages_role_check', inList(table.role, ASSISTANT_MESSAGE_ROLES)),
    foreignKey({
      columns: [table.threadId],
      foreignColumns: [assistantThreads.id],
      name: 'core_assistant_messages_thread_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_messages_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const assistantSettings = pgTable(
  'assistant_settings',
  {
    orgId: orgIdColumn().primaryKey(),
    approvalMode: text({ enum: ASSISTANT_APPROVAL_MODES }).default('writes').notNull(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      'core_assistant_settings_approval_mode_check',
      inList(table.approvalMode, ASSISTANT_APPROVAL_MODES),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_assistant_settings_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
