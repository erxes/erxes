import {
  type AUTOMATION_FIELD_TYPES,
  type AUTOMATION_SUBJECTS,
  type DefaultGrantRole,
  type INTEGRATION_CATEGORIES,
  type PLUGIN_FIELD_TYPES,
  PLUGIN_STATUSES,
  type RELATION_FIELD_TYPES,
  type RELATION_MEASURES,
  type TAX_RECEIPT_ISSUERS,
} from '../enums';
import { sql } from 'drizzle-orm';
import { foreignKey, index, jsonb, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { type ContentType, createdAt, type PluginListType, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type PluginStatus = (typeof PLUGIN_STATUSES)[number];

/** A value an event carries or an action answers, for later automation steps. */
interface StoredDataField {
  key: string;
  label: string;
  type: (typeof AUTOMATION_FIELD_TYPES)[number];
  recordType?: string;
}

/** A relation of a plugin's manifest (`PluginRelation` in the contract). */
export interface StoredPluginRelation {
  key: string;
  contentType: ContentType;
  label: string;
  view: string;
  permission?: string;
  fields: {
    key: string;
    label: string;
    type: (typeof RELATION_FIELD_TYPES)[number];
    options?: string[];
    array?: boolean;
    money?: boolean;
    /** The measures the filter offers; all that fit the type when absent. */
    measures?: Exclude<(typeof RELATION_MEASURES)[number], 'count'>[];
  }[];
}

/**
 * What a plugin declares about itself (`PUT /plugins/manifest`): where its UI
 * and API live, which core scopes it needs, and the permissions, notification
 * kinds and events it brings. Validated by the contract's `PluginManifest`.
 */
export interface StoredPluginManifest {
  title: string;
  version: string;
  description?: string;
  /** Made for these countries (ISO 3166); none: everywhere. */
  countries?: string[];
  /** `own`: it issues its invoices' tax receipts itself, so core's eBarimt never does. */
  taxReceipts?: (typeof TAX_RECEIPT_ISSUERS)[number];
  ui?: { remote: string; entry: string };
  /** `docs`: its OpenAPI documents' paths under `url`, one per audience, shown in the API reference. */
  api?: {
    url: string;
    docs?: { audience: 'member' | 'employee' | 'customer' | 'website'; path: string }[];
  };
  /** "Sign in with erxes" for the plugin's own app: where codes may be sent (`{subdomain}` allowed). */
  oauth?: { redirectUris: string[] };
  /** Paths under its API's `/public` that core forwards outside callers to (webhooks, redirects). */
  publicPaths?: string[];
  scopes: string[];
  /** Other plugins' APIs it reads, with their permissions: each waits for the owner's approval. */
  pluginReads?: { plugin: string; permissions: string[]; reason: string }[];
  permissions?: { action: string; label: string; description?: string; group?: string }[];
  /** Ready-made bundles of its permissions, added to a role in one click. */
  permissionSets?: {
    key: string;
    label: string;
    description?: string;
    permissions: string[];
    /** Built-in roles core gives the set to where the plugin is installed. */
    defaultRoles?: DefaultGrantRole[];
  }[];
  notificationKinds?: { kind: string; label: string; description?: string }[];
  events?: {
    type: string;
    label: string;
    description?: string;
    subject?: ContentType;
    record?: string;
    fields?: StoredDataField[];
  }[];
  /** Events it wants at `<api.url>/events` (patterns: `core.payment.*`). */
  subscriptions?: string[];
  /**
   * Its jobs, POSTed to `<api.url>/jobs/<name>`; `cron` (UTC) runs one per organisation,
   * `onInstall` one when an organisation installs the plugin or approves its new scopes.
   */
  jobs?: {
    name: string;
    cron?: string;
    onInstall?: boolean;
    retry?: { attempts: number; delay: number; maxDelay: number };
  }[];
  timelines?: { type: string; label: string; permission?: string; recordAccess?: boolean }[];
  /** Fields it keeps on customers or companies: core stores them as custom fields, the plugin their values. */
  fields?: {
    code: string;
    contentType: ContentType;
    label: string;
    type: (typeof PLUGIN_FIELD_TYPES)[number];
    options?: string[];
    description?: string;
    /** `false`: a column and sort key only, not in list filters. */
    filterable?: boolean;
  }[];
  /**
   * Its records that belong to customers or companies, read from its view `view` (`record_id`
   * and a column per field), so their lists filter by them.
   */
  relations?: StoredPluginRelation[];
  /** Its record types members import and export through core: core asks `<api.url>/transfer/*` for the rows. */
  transfer?: {
    type: PluginListType;
    label: string;
    exportPermission: string;
    importPermission: string;
    columns: {
      key: string;
      label: string;
      importable: boolean;
      exportable: boolean;
      default: boolean;
      aliases?: string[];
    }[];
    /** The column whose filled rows start a batch (`PluginTransfer` in the contract). */
    batchStart?: string;
  }[];
  activityTypes?: { type: string; label: string; icon?: string; color?: string }[];
  /** Its integrations in Settings › Integrations, next to core's; it reports each one's state. */
  integrations?: {
    key: string;
    name: string;
    summary: string;
    category: (typeof INTEGRATION_CATEGORIES)[number];
    countries?: string[];
    permission: string;
  }[];
  actions?: {
    type: string;
    label: string;
    description?: string;
    subject?: (typeof AUTOMATION_SUBJECTS)[number];
    integration?: string;
    fields: {
      key: string;
      label: string;
      type: string;
      required: boolean;
      options?: { value: string; label: string }[];
      description?: string;
    }[];
    outputs?: StoredDataField[];
  }[];
  assistant?: {
    skills: { name: string; description: string; instructions: string }[];
  };
  /** Agents core runs for it, as `<plugin>.<name>`; `tools` are operationIds of its member API document. */
  agents?: { name: string; description: string; instructions: string; tools: string[] }[];
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
    orgId: orgIdColumn(),
    plugin: text().notNull(),
    status: text({ enum: PLUGIN_STATUSES }).default('active').notNull(),
    /** Why it is off (`Suspended: 600 deletions in 5 minutes`), for the owner. */
    statusReason: text(),
    grantedScopes: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
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
