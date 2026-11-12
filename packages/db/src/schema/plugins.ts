import { sql } from 'drizzle-orm';
import { foreignKey, index, jsonb, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const PLUGIN_STATUSES = ['active', 'disabled'] as const;
export type PluginStatus = (typeof PLUGIN_STATUSES)[number];

/**
 * What a plugin declares about itself (`PUT /plugins/manifest`): where its UI
 * and API live, which core scopes it needs, and the permissions, notification
 * kinds and events it brings. Validated by the contract's `PluginManifest`.
 */
export interface StoredPluginManifest {
  title: string;
  version: string;
  description?: string;
  ui?: { remote: string; entry: string };
  api?: { url: string };
  /** "Sign in with erxes" for the plugin's own app: where codes may be sent (`{subdomain}` allowed). */
  oauth?: { redirectUris: string[] };
  scopes: string[];
  permissions?: { action: string; label: string; description?: string; group?: string }[];
  notificationKinds?: { kind: string; label: string; description?: string }[];
  events?: { type: string; label: string; description?: string }[];
  timelines?: { type: string; label: string; permission?: string }[];
  activityTypes?: { type: string; label: string; icon?: string; color?: string }[];
  actions?: {
    type: string;
    label: string;
    description?: string;
    subject?: 'customer' | 'company' | 'any';
    fields: { key: string; label: string; type: string; required: boolean; options?: { value: string; label: string }[]; description?: string }[];
  }[];
}

/**
 * Plugins this deployment knows (the registry). A plugin authenticates with
 * its client secret (only the SHA-256 is stored) and exchanges it for
 * short-lived tokens per organisation. Rotation keeps the previous secret
 * working until `previousSecretExpiresAt`.
 */
export const plugins = pgTable('plugins', {
  name: text().primaryKey(),
  status: text({ enum: PLUGIN_STATUSES }).default('active').notNull(),
  manifest: jsonb().$type<StoredPluginManifest>(),
  secretHash: text(),
  previousSecretHash: text(),
  previousSecretExpiresAt: timestamptz(),
  secretRotatedAt: timestamptz(),
  /** Last token issued to the plugin (any organisation). */
  lastSeenAt: timestamptz(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * A plugin installed in an organisation, with the core scopes its owner
 * granted. Tokens are issued only for installed, active plugins, and every
 * request re-checks, so uninstalling cuts a plugin off at once.
 */
export const pluginInstallations = pgTable(
  'plugin_installations',
  {
    orgId: text().notNull(),
    plugin: text().notNull(),
    status: text({ enum: PLUGIN_STATUSES }).default('active').notNull(),
    grantedScopes: text().array().default(sql`'{}'::text[]`).notNull(),
    installedBy: text(),
    installedAt: createdAt(),
    updatedAt: updatedAt(),
    lastTokenAt: timestamptz(),
  },
  (table) => [
    primaryKey({ columns: [table.orgId, table.plugin], name: 'core_plugin_installations_pkey' }),
    index('core_plugin_installations_plugin_idx').on(table.plugin),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_plugin_installations_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.plugin],
      foreignColumns: [plugins.name],
      name: 'core_plugin_installations_plugin_fkey',
    }).onDelete('cascade'),
  ],
);
