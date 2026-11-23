import { sql } from 'drizzle-orm';
import { check, foreignKey, index, primaryKey, text } from 'drizzle-orm/pg-core';
import { ASSISTANT_PROVIDERS } from '../assistantEnums';
import { AGENT_TEMPLATES } from '../enums';
import { inList, orgIdColumn, pgTable } from '../table';
import { apiKeys } from './apiKeys';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';
import { portals } from './portals';

/**
 * Agents an admin made (Settings › AI agents), such as a shop's sales bot. One runs by the rules
 * of its own API key (`keyId`, a regular key whose secret nobody holds), on the provider and
 * model chosen here or the organisation's default. With a portal (`portalId`) it acts for the
 * customer a conversation is with, through the routes of the plugin whose portal it is.
 */
export const agents = pgTable(
  'agents',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    name: text().notNull(),
    /** The template it started from (`shop`, `hotel`, `tours`, `support`), or null. */
    template: text({ enum: AGENT_TEMPLATES }),
    instructions: text().notNull(),
    provider: text({ enum: ASSISTANT_PROVIDERS }),
    model: text(),
    keyId: text().notNull(),
    portalId: text(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_agents_org_idx').on(table.orgId, table.createdAt.desc()),
    check(
      'core_agents_template_check',
      sql`${table.template} IS NULL OR ${inList(table.template, AGENT_TEMPLATES)}`,
    ),
    check(
      'core_agents_provider_check',
      sql`${table.provider} IS NULL OR ${inList(table.provider, ASSISTANT_PROVIDERS)}`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_agents_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.keyId],
      foreignColumns: [apiKeys.id],
      name: 'core_agents_key_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.portalId],
      foreignColumns: [portals.id],
      name: 'core_agents_portal_id_fkey',
    }).onDelete('set null'),
  ],
);

/**
 * One conversation of an agent, as a plugin keys it (frontline's conversation id): the plugin
 * that talks in it and the customer it is with. Both are fixed by its first message.
 */
export const agentChats = pgTable(
  'agent_chats',
  {
    orgId: orgIdColumn(),
    agentId: text().notNull(),
    key: text().notNull(),
    plugin: text().notNull(),
    customerId: text(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.agentId, table.key], name: 'core_agent_chats_pkey' }),
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [agents.id],
      name: 'core_agent_chats_agent_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_agent_chats_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
